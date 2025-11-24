import { Injectable } from '@angular/core';
import { Subject, Observable, take } from 'rxjs';

export interface DialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'alert' | 'confirm';
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private confirmSubject = new Subject<DialogData>();
  private alertSubject = new Subject<DialogData>();
  private resultSubject = new Subject<boolean>();
  
  constructor() { }

  open(data: DialogData): Observable<boolean> {
    if (data.type === 'alert') {
      this.alertSubject.next(data);
      return new Observable<boolean>(sub => sub.next(false));
    }
    
    this.confirmSubject.next(data);
    return this.resultSubject.asObservable().pipe(take(1));
  }

  confirm(): void {
    this.resultSubject.next(true);
  }

  cancel(): void {
    this.resultSubject.next(false);
  }

  getConfirmState(): Observable<DialogData> {
    return this.confirmSubject.asObservable();
  }
  
  getAlertState(): Observable<DialogData> {
    return this.alertSubject.asObservable();
  }
}