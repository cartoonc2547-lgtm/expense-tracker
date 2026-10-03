const titleInput =
  document.getElementById("title");

const amountInput =
  document.getElementById("amount");

const dateInput =
  document.getElementById("date");

const typeInput =
  document.getElementById("type");

const categorySection =
  document.querySelector(".category-section");

const addBtn =
  document.getElementById("addBtn");

const transactionList =
  document.getElementById("transactionList");

const balanceText =
  document.getElementById("balance");

const incomeText =
  document.getElementById("income");

const expenseText =
  document.getElementById("expense");

const categoryButtons =
  document.querySelectorAll(".category-btn");


/* =========================
   ค่าเริ่มต้น
========================= */

dateInput.value =
  new Date().toISOString().split("T")[0];


let transactions =
  JSON.parse(
    localStorage.getItem("transactions")
  ) || [];


let editingId = null;

let selectedCategory = "อาหาร";


/* =========================
   ICON หมวดหมู่
========================= */

const categoryIcons = {
  "อาหาร":"🍜",
  "กาแฟ":"☕",
  "เครื่องดื่ม":"🥤",
  "เดินทาง":"🚌",
  "ช้อปปิ้ง":"🛍️",
  "บันเทิง":"🎮",
  "รายรับ":"💰"
};


/* =========================
   เลือกหมวดหมู่
========================= */

categoryButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      categoryButtons.forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      selectedCategory =
        button.dataset.category;

    }
  );

});


/* =========================
   ซ่อนหมวดตอนเป็นรายรับ
========================= */

function updateCategoryVisibility(){

  if(typeInput.value === "income"){

    categorySection.style.display =
      "none";

    selectedCategory =
      "รายรับ";

  }else{

    categorySection.style.display =
      "block";

    if(
      selectedCategory === "รายรับ"
    ){

      selectedCategory =
        "อาหาร";

      categoryButtons.forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.category === "อาหาร"
          );

        }
      );

    }

  }

}


typeInput.addEventListener(
  "change",
  updateCategoryVisibility
);


/* =========================
   บันทึกข้อมูล
========================= */

function saveTransactions(){

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

}


/* =========================
   เพิ่ม / แก้ไขรายการ
========================= */

function addTransaction(){

  const title =
    titleInput.value.trim();

  const amount =
    Number(amountInput.value);

  const type =
    typeInput.value;

  const date =
    dateInput.value;


  if(
    title === "" ||
    amount <= 0 ||
    date === ""
  ){

    alert(
      "กรุณากรอกชื่อรายการ จำนวนเงิน และวันที่"
    );

    return;
  }


  /* =========================
     แก้ไขรายการเดิม
  ========================= */

  if(
    editingId !== null
  ){

    const transaction =
      transactions.find(
        item =>
          item.id === editingId
      );


    if(transaction){

      transaction.title =
        title;

      transaction.amount =
        amount;

      transaction.type =
        type;

      transaction.category =
        type === "income"
        ? "รายรับ"
        : selectedCategory;

      transaction.date =
        date;

    }


    editingId =
      null;


    addBtn.innerText =
      "เพิ่มรายการ";

  }


  /* =========================
     เพิ่มรายการใหม่
  ========================= */

  else{

    const transaction = {

      id:
        Date.now(),

      title:
        title,

      amount:
        amount,

      type:
        type,

      category:
        type === "income"
        ? "รายรับ"
        : selectedCategory,

      date:
        date

    };


    transactions.push(
      transaction
    );

  }


  /* =========================
     ล้างฟอร์ม
  ========================= */

  titleInput.value =
    "";

  amountInput.value =
    "";

  dateInput.value =
    new Date()
      .toISOString()
      .split("T")[0];


  saveTransactions();

  renderTransactions();

}


/* =========================
   แปลงวันที่
========================= */

function getDateObject(date){

  if(
    !date ||
    date === "ไม่ระบุวันที่"
  ){

    return null;

  }


  /* วันที่ใหม่ 2026-10-04 */

  if(
    date.includes("-")
  ){

    const obj =
      new Date(
        date + "T00:00:00"
      );


    return isNaN(obj)
      ? null
      : obj;

  }


  /* วันที่เก่า 4/10/2569 */

  if(
    date.includes("/")
  ){

    const parts =
      date.split("/");


    if(
      parts.length === 3
    ){

      const day =
        Number(parts[0]);

      const month =
        Number(parts[1]) - 1;

      let year =
        Number(parts[2]);


      if(
        year > 2400
      ){

        year -= 543;

      }


      const obj =
        new Date(
          year,
          month,
          day
        );


      return isNaN(obj)
        ? null
        : obj;

    }

  }


  return null;

}


/* =========================
   แสดงรายการ
========================= */

function renderTransactions(){

  transactionList.innerHTML =
    "";


  if(
    transactions.length === 0
  ){

    transactionList.innerHTML = `
      <p class="empty">
        ยังไม่มีรายการ
      </p>
    `;

    updateSummary();

    return;

  }


  /* =========================
     แยกรายการตามวันที่
  ========================= */

  const grouped = {};


  transactions.forEach(
    transaction => {

      const date =
        transaction.date ||
        "ไม่ระบุวันที่";


      if(
        !grouped[date]
      ){

        grouped[date] = [];

      }


      grouped[date].push(
        transaction
      );

    }
  );


  /* =========================
     เรียงวันที่ ใหม่ -> เก่า
  ========================= */

  const sortedDates =
    Object.keys(grouped)
      .sort(
        (a,b) => {

          const dateA =
            getDateObject(a);

          const dateB =
            getDateObject(b);


          if(
            !dateA &&
            !dateB
          ){

            return 0;

          }


          if(
            !dateA
          ){

            return 1;

          }


          if(
            !dateB
          ){

            return -1;

          }


          return (
            dateB.getTime() -
            dateA.getTime()
          );

        }
      );


  /* =========================
     สร้างแต่ละวัน
  ========================= */

  sortedDates.forEach(
    date => {

      const dayGroup =
        document.createElement(
          "div"
        );


      dayGroup.className =
        "day-group";


      /* =========================
         ยอดรวมรายวัน
      ========================= */

      let dayIncome = 0;

      let dayExpense = 0;


      grouped[date].forEach(
        transaction => {

          if(
            transaction.type ===
            "income"
          ){

            dayIncome +=
              transaction.amount;

          }else{

            dayExpense +=
              transaction.amount;

          }

        }
      );


      /* =========================
         หัววันที่
      ========================= */

      const dateTitle =
        document.createElement(
          "div"
        );


      dateTitle.className =
        "date-title";


      const dateObj =
        getDateObject(date);


      let dateLabel =
        "ไม่ระบุวันที่";


      if(
        dateObj
      ){

        dateLabel =
          dateObj.toLocaleDateString(
            "th-TH",
            {
              day:"numeric",
              month:"short",
              year:"numeric"
            }
          );

      }


      dateTitle.innerHTML = `

        <span>
          ${dateLabel}
        </span>

        <span class="day-total">

          ${
            dayIncome > 0
            ? `
              <span class="day-income">
                +฿${dayIncome.toLocaleString()}
              </span>
            `
            : ""
          }

          ${
            dayExpense > 0
            ? `
              <span class="day-expense">
                -฿${dayExpense.toLocaleString()}
              </span>
            `
            : ""
          }

        </span>

      `;


      dayGroup.appendChild(
        dateTitle
      );


      /* =========================
         รายการในวันนั้น
      ========================= */

      grouped[date].forEach(
        transaction => {

          const item =
            document.createElement(
              "div"
            );


          item.className =
            `transaction ${transaction.type}`;


          const sign =
            transaction.type ===
            "income"
            ? "+"
            : "-";


          const detailText =
            transaction.type ===
            "income"

            ? "รายรับ"

            : `รายจ่าย • ${
                transaction.category ||
                "อื่นๆ"
              }`;


          /* =========================
             ICON
          ========================= */

          const icon =
            transaction.type ===
            "income"

            ? "💰"

            : categoryIcons[
                transaction.category
              ] || "💳";


          /* =========================
             HTML รายการ
          ========================= */

          item.innerHTML = `

            <div class="transaction-left">

              <div class="transaction-icon">
                ${icon}
              </div>

              <div>

                <div class="transaction-title">
                  ${transaction.title}
                </div>

                <small>
                  ${detailText}
                </small>

              </div>

            </div>


            <div class="transaction-right">

              <div class="money">
                ${sign}฿${transaction.amount.toLocaleString()}
              </div>

              <button
                type="button"
                class="edit-btn"
              >
                ✏️
              </button>

              <button
                type="button"
                class="delete-btn"
              >
                🗑️
              </button>

            </div>

          `;


          /* =========================
             ปุ่มลบ
          ========================= */

          const deleteBtn =
            item.querySelector(
              ".delete-btn"
            );


          deleteBtn.addEventListener(
            "click",
            () => {

              deleteTransaction(
                transaction.id
              );

            }
          );


          /* =========================
             ปุ่มแก้ไข
          ========================= */

          const editBtn =
            item.querySelector(
              ".edit-btn"
            );


          editBtn.addEventListener(
            "click",
            () => {

              editTransaction(
                transaction.id
              );

            }
          );


          dayGroup.appendChild(
            item
          );

        }
      );


      transactionList.appendChild(
        dayGroup
      );

    }
  );


  updateSummary();

}


/* =========================
   ลบรายการ
========================= */

function deleteTransaction(id){

  transactions =
    transactions.filter(
      transaction =>
        transaction.id !== id
    );


  saveTransactions();

  renderTransactions();

}


/* =========================
   แก้ไขรายการ
========================= */

function editTransaction(id){

  const transaction =
    transactions.find(
      item =>
        item.id === id
    );


  if(
    !transaction
  ){

    return;

  }


  titleInput.value =
    transaction.title;


  amountInput.value =
    transaction.amount;


  typeInput.value =
    transaction.type;


  /* =========================
     วันที่
  ========================= */

  const dateObj =
    getDateObject(
      transaction.date
    );


  if(
    dateObj
  ){

    const year =
      dateObj.getFullYear();


    const month =
      String(
        dateObj.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        dateObj.getDate()
      ).padStart(
        2,
        "0"
      );


    dateInput.value =
      `${year}-${month}-${day}`;

  }


  /* =========================
     ประเภท / หมวด
  ========================= */

  selectedCategory =
    transaction.type ===
    "income"

    ? "รายรับ"

    : (
        transaction.category ||
        "อาหาร"
      );


  updateCategoryVisibility();


  categoryButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.category ===
        selectedCategory
      );

    }
  );


  editingId =
    id;


  addBtn.innerText =
    "บันทึกการแก้ไข";


  /* =========================
     เลื่อนขึ้นฟอร์ม
  ========================= */

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================
   สรุปยอด
========================= */

function updateSummary(){

  let income = 0;

  let expense = 0;


  transactions.forEach(
    transaction => {

      if(
        transaction.type ===
        "income"
      ){

        income +=
          transaction.amount;

      }else{

        expense +=
          transaction.amount;

      }

    }
  );


  const balance =
    income - expense;


  incomeText.innerText =
    `฿${income.toLocaleString()}`;


  expenseText.innerText =
    `฿${expense.toLocaleString()}`;


  balanceText.innerText =
    `฿${balance.toLocaleString()}`;

}


/* =========================
   เริ่มต้น
========================= */

updateCategoryVisibility();

renderTransactions();


addBtn.addEventListener(
  "click",
  addTransaction
);