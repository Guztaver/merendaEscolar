import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para gerenciar estado
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    // Verificar se há mensagem de logout, sessão expirada ou cadastro
    const urlParams = new URLSearchParams(window.location.search);
    const loggedOut = urlParams.get('loggedOut');
    const sessionExpired = urlParams.get('sessionExpired');
    const registered = urlParams.get('registered');

    if (loggedOut === 'true') {
      this.successMessage.set('Você saiu do sistema com sucesso.');
    }

    if (sessionExpired === 'true') {
      this.errorMessage.set('Sua sessão expirou. Por favor, faça login novamente.');
    }

    if (registered === 'true') {
      this.successMessage.set('Cadastro realizado com sucesso! Faça login para continuar.');
    }

    // Limpar params da URL
    if (loggedOut || sessionExpired || registered) {
      window.history.replaceState({}, '', '/login');
    }

    // Verificar returnUrl
    const returnUrl = urlParams.get('returnUrl');
    if (returnUrl) {
      this.successMessage.set('Por favor, faça login para continuar.');
    }
  }

  onSubmit() {
    // Limpar mensagens anteriores
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    const { email, password } = this.loginForm.value;
    if (!email || !password) {
      this.errorMessage.set('Por favor, preencha todos os campos.');
      return;
    }

    this.loading.set(true);

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);

        // Redirecionar para a URL de retorno ou para home
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        this.router.navigate([returnUrl || '/']);
      },
      error: (err) => {
        this.loading.set(false);

        // Tratar diferentes tipos de erro
        if (err.status === 401) {
          this.errorMessage.set('E-mail ou senha incorretos. Por favor, tente novamente.');
        } else if (err.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else if (err.status === 500) {
          this.errorMessage.set('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
        }

        console.error('Login failed:', err);
      }
    });
  }

  // Marcar todos os campos como tocados para mostrar validações
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para facilitar no template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get emailError(): string {
    if (this.email?.errors?.['required']) {
      return 'E-mail é obrigatório';
    }
    if (this.email?.errors?.['email']) {
      return 'E-mail inválido';
    }
    return '';
  }

  get passwordError(): string {
    if (this.password?.errors?.['required']) {
      return 'Senha é obrigatória';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}
