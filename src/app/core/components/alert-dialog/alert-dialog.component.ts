import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DialogService, DialogData } from '../../services/dialog.service';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit, OnDestroy {
  isOpen = false;
  data: DialogData | null = null;
  private subs = new Subscription();

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.subs.add(
      this.dialogService.getConfirmState().subscribe(data => {
        this.data = { ...data, type: 'confirm' };
        this.isOpen = true;
      })
    );
    
    this.subs.add(
      this.dialogService.getAlertState().subscribe(data => {
        this.data = { ...data, type: 'alert' };
        this.isOpen = true;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onConfirm(): void {
    this.isOpen = false;
    this.data = null;
    this.dialogService.confirm();
  }

  onCancel(): void {
    this.isOpen = false;
    this.data = null;
    this.dialogService.cancel();
  }
}