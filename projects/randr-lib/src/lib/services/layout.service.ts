import { Injectable, signal } from '@angular/core';
//import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private pageTitle = signal<string>('');

  setPageTitle(title: string) {
    this.pageTitle.set(title);
    // Optionally, you can also update the document title
    document.title = title;
  }

  getPageTitle() {
    return this.pageTitle();
  }

  public LayoutChange$ = new ReplaySubject<boolean>();

  activeBreakpoints: string[] = [];

  constructor() {
    // this.breakpointObserver
    //   .observe([
    //     Breakpoints.XSmall,
    //     Breakpoints.Small,
    //     Breakpoints.Medium,
    //     Breakpoints.Large,
    //     Breakpoints.XLarge,
    //     Breakpoints.HandsetPortrait,
    //     Breakpoints.TabletPortrait,
    //     Breakpoints.WebPortrait,
    //     Breakpoints.HandsetLandscape,
    //     Breakpoints.TabletLandscape,
    //     Breakpoints.WebLandscape
    //   ])
    //   .pipe(
    //     takeUntilDestroyed()
    //   )
    //   .subscribe((state) => {
    //     this.LayoutChange$.next(true);
    //   });
  }

  // isBreakpointActive(breakpointName: string | string[]): boolean {
  //   return this.breakpointObserver.isMatched(breakpointName);
  // }

  // getWidthClass(): string {
  //   if (this.breakpointObserver.isMatched(Breakpoints.XLarge)) {
  //     return "XLarge";
  //   }
  //   else if (this.breakpointObserver.isMatched(Breakpoints.Large)) {
  //     return "Large";
  //   }
  //   else if (this.breakpointObserver.isMatched(Breakpoints.Medium)) {
  //     return "Medium";
  //   }
  //   else if (this.breakpointObserver.isMatched(Breakpoints.Small)) {
  //     return "Small";
  //   }
  //   else {
  //     return "XSmall";
  //   }
  // }
}
