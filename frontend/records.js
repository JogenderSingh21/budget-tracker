document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token not found. Please log in.");
    window.location.href = "Signup.html";
    return;
  }
  const spreadSheetdata = [];

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
    expenses.forEach((expense) => {
      spreadSheetdata.push({
        amount: expense.amount * -1,
        type: "Expense",
        description: expense.description,
        date: new Date(expense.createdAt).toDateString(),
        time: new Date(expense.createdAt).toLocaleTimeString(),
        createdAt: expense.createdAt,
      });
    });

    incomes.forEach((income) => {
      spreadSheetdata.push({
        amount: income.amount,
        type: "Income",
        description: income.description,
        date: new Date(income.createdAt).toDateString(),
        time: new Date(income.createdAt).toLocaleTimeString(),
        createdAt: income.createdAt,
      });
    });
    console.log(expenses, incomes);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert(error);
  }
  spreadSheetdata.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }
    return 0;
  });
  const container = document.querySelector("#exampleFilterBasicDemo");
  const handsontableInstance = new Handsontable(container, {
    data: spreadSheetdata,
    columns: [
      {
        title: "Amount",
        type: "numeric",
        data: "amount",
        numericFormat: {
          pattern: "0,0.00",
        },
        className: "htRight",
      },
      {
        title: "Type",
        type: "text",
        data: "type",
        className: "htRight",
      },
      {
        title: "Description",
        type: "text",
        data: "description",
        className: "htRight",
      },
      {
        title: "Date",
        type: "date",
        data: "date",
        dateFormat: "MMM D, YYYY",
        correctFormat: true,
        className: "htRight",
      },
      {
        title: "Time",
        type: "time",
        data: "time",
        timeFormat: "hh:mm A",
        correctFormat: true,
        className: "htRight",
      },
    ],
    filters: true,
    dropdownMenu: true,
    height: "auto",
    stretchH: "all",
    autoWrapRow: true,
    autoWrapCol: true,
    readOnly: true,
    licenseKey: "non-commercial-and-evaluation",
  });
  const downloadButton = document.querySelector("#downloadButton");

  downloadButton.addEventListener("click", function () {
    const exportData = handsontableInstance
      .getPlugin("exportFile")
      .exportAsString("csv", { bom: false });

    const blob = new Blob([exportData], { type: "text/csv;charset=utf-8" });

    saveAs(blob, "handsontable_data.csv");
  });
});
