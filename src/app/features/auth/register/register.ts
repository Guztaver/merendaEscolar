import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para gerenciar estado
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  }, { validators: this.passwordMatchValidator() });

  // Validador customizado para verificar se as senhas coincidem
  passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;

      return password && confirmPassword && password === confirmPassword
        ? null
        : { passwordMismatch: true };
    };
  }

  onSubmit() {
    // Limpar mensagens anteriores
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    const { name, email, password } = this.registerForm.value;
    if (!name || !email || !password) {
      this.errorMessage.set('Por favor, preencha todos os campos.');
      return;
    }

    this.loading.set(true);

    this.authService.register({ email, password, name }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Cadastro realizado com sucesso! Redirecionando para o login...');

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);

        // Tratar diferentes tipos de erro
        if (err.status === 409) {
          this.errorMessage.set('Este e-mail já está cadastrado. Use outro e-mail ou faça login.');
        } else if (err.status === 400) {
          this.errorMessage.set('Dados inválidos. Verifique as informações e tente novamente.');
        } else if (err.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else if (err.status === 500) {
          this.errorMessage.set('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao criar conta. Por favor, tente novamente.');
        }

        console.error('Registration failed:', err);
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
  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get nameError(): string {
    if (this.name?.errors?.['required']) {
      return 'Nome é obrigatório';
    }
    if (this.name?.errors?.['minlength']) {
      return 'Nome deve ter no mínimo 2 caracteres';
    }
    return '';
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

  get confirmPasswordError(): string {
    if (this.confirmPassword?.errors?.['required']) {
      return 'Confirmação de senha é obrigatória';
    }
    if (this.confirmPassword?.errors?.['minlength']) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    if (this.registerForm.errors?.['passwordMismatch']) {
      return 'As senhas não coincidem';
    }
    return '';
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  // Verificar força da senha
  getPasswordStrength(): { strength: string; color: string; width: string } {
    const password = this.password?.value || '';
    if (!password) {
      return { strength: '', color: '#e5e7eb', width: '0%' };
    }

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { strength: 'Fraca', color: '#ef4444', width: '33%' };
    } else if (strength <= 4) {
      return { strength: 'Média', color: '#f59e0b', width: '66%' };
    } else {
      return { strength: 'Forte', color: '#10b981', width: '100%' };
    }
  }
}
