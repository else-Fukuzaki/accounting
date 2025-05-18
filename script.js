// データを管理するクラス
class FinanceManager {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  }

  // 取引を追加
  addTransaction(transaction) {
    this.transactions.push(transaction);
    this.saveTransactions();
    return transaction;
  }

  // 取引を削除
  deleteTransaction(id) {
    this.transactions = this.transactions.filter(
      (transaction) => transaction.id !== id
    );
    this.saveTransactions();
  }

  // 全ての取引を取得
  getAllTransactions() {
    return this.transactions;
  }

  // 特定の月の取引を取得
  getTransactionsByMonth(year, month) {
    return this.transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }

  // 特定の月の売上合計を取得
  getMonthlyIncome(year, month) {
    const monthlyTransactions = this.getTransactionsByMonth(year, month);
    return monthlyTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  // 特定の月の支出合計を取得
  getMonthlyExpense(year, month) {
    const monthlyTransactions = this.getTransactionsByMonth(year, month);
    return monthlyTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  // 特定の月の収支バランスを取得
  getMonthlyBalance(year, month) {
    return (
      this.getMonthlyIncome(year, month) - this.getMonthlyExpense(year, month)
    );
  }

  // 累計残高を取得
  getTotalBalance() {
    return this.transactions.reduce((balance, transaction) => {
      if (transaction.type === 'income') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  }

  // ローカルストレージにデータを保存
  saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
  }
}

// UI操作を管理するクラス
class UIManager {
  constructor(financeManager) {
    this.financeManager = financeManager;
    this.initializeEventListeners();
    this.updateUI();
  }

  // イベントリスナーの初期化
  initializeEventListeners() {
    // フォーム送信イベント
    document
      .getElementById('transaction-form')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });

    // フィルターボタンイベント
    document.getElementById('filter-btn').addEventListener('click', () => {
      this.filterTransactions();
    });

    // 月フィルターの初期設定（現在の月）
    const now = new Date();
    const monthInput = document.getElementById('month-filter');
    monthInput.value = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  // フォーム送信処理
  handleFormSubmit() {
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const type = document.getElementById('type').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!date || !description || !amount) {
      alert('すべての項目を入力してください');
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      date,
      description,
      type,
      amount,
    };

    this.financeManager.addTransaction(transaction);
    this.updateUI();
    this.resetForm();
  }

  // フォームリセット
  resetForm() {
    document.getElementById('transaction-form').reset();
    // 日付は今日の日付をデフォルトに設定
    document.getElementById('date').value = new Date()
      .toISOString()
      .split('T')[0];
  }

  // 月フィルター処理
  filterTransactions() {
    this.updateUI();
  }

  // 取引削除処理
  handleDeleteTransaction(id) {
    if (confirm('この取引を削除してもよろしいですか？')) {
      this.financeManager.deleteTransaction(id);
      this.updateUI();
    }
  }

  // UI更新処理
  updateUI() {
    this.updateSummary();
    this.updateTotalBalance();
    this.displayTransactions();
  }

  // サマリー更新
  updateSummary() {
    const monthFilter = document.getElementById('month-filter').value;
    const [year, month] = monthFilter.split('-').map(Number);

    const income = this.financeManager.getMonthlyIncome(year, month - 1);
    const expense = this.financeManager.getMonthlyExpense(year, month - 1);
    const balance = income - expense;

    document.getElementById(
      'income-total'
    ).textContent = `${income.toLocaleString()}円`;
    document.getElementById(
      'expense-total'
    ).textContent = `${expense.toLocaleString()}円`;
    document.getElementById(
      'balance-total'
    ).textContent = `${balance.toLocaleString()}円`;
  }

  // 累計残高更新
  updateTotalBalance() {
    const totalBalance = this.financeManager.getTotalBalance();
    document.getElementById(
      'total-balance'
    ).textContent = `${totalBalance.toLocaleString()}円`;
  }

  // 取引履歴表示
  displayTransactions() {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    const monthFilter = document.getElementById('month-filter').value;
    const [year, month] = monthFilter.split('-').map(Number);

    const transactions = this.financeManager.getTransactionsByMonth(
      year,
      month - 1
    );

    if (transactions.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML =
        '<td colspan="5" style="text-align: center;">データがありません</td>';
      transactionList.appendChild(emptyRow);
      return;
    }

    transactions.forEach((transaction) => {
      const row = document.createElement('tr');

      // 日付のフォーマット
      const date = new Date(transaction.date);
      const formattedDate = `${date.getFullYear()}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

      // 種類の日本語表示
      const typeText = transaction.type === 'income' ? '売上' : '支出';
      const typeColor =
        transaction.type === 'income' ? 'color: #27ae60;' : 'color: #e74c3c;';

      row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td style="${typeColor}">${typeText}</td>
                <td style="${typeColor}">${transaction.amount.toLocaleString()}円</td>
                <td><button class="delete-btn">削除</button></td>
            `;

      // 削除ボタンにイベントリスナーを追加
      const deleteBtn = row.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        this.handleDeleteTransaction(transaction.id);
      });

      transactionList.appendChild(row);
    });
  }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
  // 現在の日付をデフォルトとして設定
  document.getElementById('date').valueAsDate = new Date();

  // アプリケーション開始
  const financeManager = new FinanceManager();
  const uiManager = new UIManager(financeManager);
});
