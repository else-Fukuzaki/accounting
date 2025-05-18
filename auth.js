// 認証管理クラス
class AuthManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    this.initializeAuthForms();
  }

  // 認証フォームの初期化
  initializeAuthForms() {
    // フォーム切り替え処理
    document.getElementById('show-register').addEventListener('click', (e) => {
      e.preventDefault();
      document
        .getElementById('login-form-container')
        .classList.remove('active');
      document
        .getElementById('register-form-container')
        .classList.add('active');
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
      e.preventDefault();
      document
        .getElementById('register-form-container')
        .classList.remove('active');
      document.getElementById('login-form-container').classList.add('active');
    });

    // 登録フォーム送信処理
    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegistration();
    });

    // ログインフォーム送信処理
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  // ユーザー登録処理
  handleRegistration() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById(
      'register-confirm-password'
    ).value;
    const errorElement = document.getElementById('register-error');

    // 入力検証
    if (!name || !email || !password) {
      errorElement.textContent = '全ての項目を入力してください';
      return;
    }

    if (password !== confirmPassword) {
      errorElement.textContent = 'パスワードが一致しません';
      return;
    }

    if (password.length < 6) {
      errorElement.textContent = 'パスワードは6文字以上で入力してください';
      return;
    }

    // メールアドレスの重複チェック
    if (this.users.some((user) => user.email === email)) {
      errorElement.textContent = 'このメールアドレスは既に登録されています';
      return;
    }

    // ユーザー登録
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      // 実際のアプリではパスワードをハッシュ化すべきですが、
      // クライアントサイドのみの実装ではセキュリティ上の制約があります
      password: this.simpleHash(password),
    };

    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));

    // 登録成功後の処理
    this.login(newUser);
  }

  // ログイン処理
  handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    // 入力検証
    if (!email || !password) {
      errorElement.textContent = 'メールアドレスとパスワードを入力してください';
      return;
    }

    // ユーザー認証
    const user = this.users.find((user) => user.email === email);

    if (!user || user.password !== this.simpleHash(password)) {
      errorElement.textContent =
        'メールアドレスまたはパスワードが正しくありません';
      return;
    }

    // ログイン成功
    this.login(user);
  }

  // ログイン実行
  login(user) {
    // パスワードを含まないユーザー情報をセッションに保存
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    this.currentUser = sessionUser;
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));

    // メインアプリにリダイレクト
    window.location.href = 'index.html';
  }

  // ログアウト処理
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }

  // ユーザーがログインしているか確認
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // 単純なハッシュ化関数（実際のアプリではより安全な方法を使用すべき）
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return hash.toString(16);
  }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
  const authManager = new AuthManager();
});
