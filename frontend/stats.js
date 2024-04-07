let expenseChart = null;
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token not found. Please log in.");
    window.location.href = "Signup.html";
    return;
  }

  try {
    const expensesResponse = await fetch(
      "http://localhost:3000/api/v1/expense/all",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const incomesResponse = await fetch(
      "http://localhost:3000/api/v1/income/all",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!expensesResponse.ok || !incomesResponse.ok) {
      throw new Error("Failed to fetch expenses or incomes");
    }

    const expensesData = await expensesResponse.json();
    const incomesData = await incomesResponse.json();
    const expenses = expensesData.expenses;
    const incomes = incomesData.incomes;
    console.log(expenses, incomes);

    drawExpenseBarChart(expenses, "Total");

    const selectElement = document.getElementById("expenseFilterSelect");
    const dateInputElement = document.getElementById("expenseFilterDate");

    selectElement.addEventListener("change", function () {
      if (selectElement.value === "date") {
        const newDate = new Date(dateInputElement.value);
        const dateExpenses = filterByDate(expenses, newDate);
        drawExpenseBarChart(dateExpenses, `${dateInputElement.value}`);
        dateInputElement.style.display = "inline-block";
      } else {
        dateInputElement.style.display = "none";
        if (selectElement.value === "today") {
          const today = new Date();
          const todayExpenses = filterByDate(expenses, today);
          drawExpenseBarChart(todayExpenses, "Today's");
        } else if (selectElement.value === "month") {
          const oneMonthAgo = new Date();
          const today = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const oneMonthExpenses = filterByDateRange(
            expenses,
            oneMonthAgo,
            today
          );
          drawExpenseBarChart(oneMonthExpenses, "This Month's");
        } else if (selectElement.value === "all") {
          drawExpenseBarChart(expenses, "Total");
        }
      }
    });

    const incomesByCategory = {};

    incomes.forEach((income) => {
      if (!incomesByCategory[income.description]) {
        incomesByCategory[income.description] = 0;
      }
      incomesByCategory[income.description] += income.amount;
    });

    const incomeCategories = Object.keys(incomesByCategory);
    const totalIncomes = Object.values(incomesByCategory);

    drawIncomeBarChart(totalIncomes, incomeCategories);
    document.getElementById("loader-div").style.display = "none";

    // // Calculate and display today's data (income and expense)
    // const todayIncomes = filterByDate(incomes, today);

    // displayData("todayExpenses", todayExpenses);
    // displayData("todayIncomes", todayIncomes);

    // // Calculate and display data for the past week (income and expense)
    // const oneWeekAgo = new Date();
    // oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // const oneWeekExpenses = filterByDateRange(expenses, oneWeekAgo, today);
    // const oneWeekIncomes = filterByDateRange(incomes, oneWeekAgo, today);

    // displayData("oneWeekExpenses", oneWeekExpenses);
    // displayData("oneWeekIncomes", oneWeekIncomes);

    // // Calculate and display data for the past month (income and expense)

    // const oneMonthIncomes = filterByDateRange(incomes, oneMonthAgo, today);

    // displayData("oneMonthExpenses", oneMonthExpenses);
    // displayData("oneMonthIncomes", oneMonthIncomes);

    // // Calculate and display total income, total expense, and balance
    // const totalIncome = calculateTotalAmount(incomes);
    // const totalExpense = calculateTotalAmount(expenses);
    // const balance = totalIncome - totalExpense;

    // displayTotal("totalIncome", totalIncome);
    // displayTotal("totalExpense", totalExpense);
    // displayTotal("totalBalance", balance);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert(error);
  }
});

const filterByDate = (data, date) => {
  return data
    ? data.filter(
        (item) =>
          new Date(item.createdAt).toDateString() === date.toDateString()
      )
    : "";
};

const filterByDateRange = (data, startDate, endDate) => {
  return data
    ? data.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
      })
    : "";
};

const calculateTotalAmount = (data) => {
  return data ? data.reduce((total, item) => total + item.amount, 0) : 0;
};

const displayData = (containerId, data) => {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  let totalAmount = 0;

  data
    ? data.forEach((item) => {
        totalAmount += item.amount;
      })
    : null;

  container.textContent = `${totalAmount ? totalAmount : 0.0}`;

  console.log(containerId, data);
};

const displayTotal = (elementId, total) => {
  const element = document.getElementById(elementId);
  element.textContent = `${total}`;
  console.log(elementId, total);
};

const drawExpenseBarChart = (expenses, label) => {
  const expensesByCategory = {};
  expenses.forEach((expense) => {
    if (!expensesByCategory[expense.description]) {
      expensesByCategory[expense.description] = 0;
    }
    expensesByCategory[expense.description] += expense.amount;
  });

  const categories = Object.keys(expensesByCategory);
  const totalExpenses = Object.values(expensesByCategory);
  const ctx = document.getElementById("expenseChart").getContext("2d");

  if (expenseChart) {
    expenseChart.destroy();
  }

  // Create the chart
  expenseChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories, // Categories on X-axis
      datasets: [
        {
          label: `${label} Expenses`,
          data: totalExpenses, // Expenses on Y-axis
          backgroundColor: "rgba(54, 162, 235, 0.5)", // Bar fill color
          borderColor: "rgba(54, 162, 235, 1)", // Bar border color
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function (value) {
                return "$" + value; // Format Y-axis labels as currency
              },
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Total Expenses by Category",
      },
    },
  });
};

const drawIncomeBarChart = (totalIncome, categories) => {
  const ctx = document.getElementById("incomeChart").getContext("2d");

  // Create the pie chart
  const incomePieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories, // Categories for pie chart sections
      datasets: [
        {
          label: "Total Expenses",
          data: totalIncome, // Expenses corresponding to each category
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)", // Red
            "rgba(54, 162, 235, 0.5)", // Blue
            "rgba(255, 205, 86, 0.5)", // Yellow
            "rgba(75, 192, 192, 0.5)", // Green
            "rgba(153, 102, 255, 0.5)", // Purple
            // Add more colors as needed...
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            // Add more colors as needed...
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "Total Incomes by Category",
      },
      legend: {
        display: true,
        position: "bottom",
      },
    },
  });
};
