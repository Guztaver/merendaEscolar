import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-logistics-dashboard',
    imports: [RouterLink],
    templateUrl: './logistics-dashboard.html',
    styleUrl: './logistics-dashboard.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogisticsDashboardComponent {
}
