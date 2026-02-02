import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-nutritional-dashboard',
    imports: [RouterLink],
    templateUrl: './nutritional-dashboard.html',
    styleUrl: './nutritional-dashboard.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NutritionalDashboardComponent {
}
