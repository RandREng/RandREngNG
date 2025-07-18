import { FormGroup, ValidationErrors } from '@angular/forms';

/* // Generic validator for Reactive forms
// Implemented as a class, not a service, so it can retain state for multiple forms.
export class GenericValidator {
  // Provide the set of valid validation messages
  // Structure:
  // controlName1: {
  //     validationRuleName1: 'Validation Message.',
  //     validationRuleName2: 'Validation Message.'
  // },
  // controlName2: {
  //     validationRuleName1: 'Validation Message.',
  //     validationRuleName2: 'Validation Message.'
  // }
  constructor(
    private validationMessages: { [key: string]: { [key: string]: string } }
  ) { }

  // Processes each control within a FormGroup
  // And returns a set of validation messages to display
  // Structure
  // controlName1: 'Validation Message.',
  // controlName2: 'Validation Message.'
  processMessages(container: FormGroup): { [key: string]: string } {
    const messages: { [key: string]: string } = {};
    for (const controlKey in container.controls) {
      if (Object.prototype.hasOwnProperty.call(container.controls, controlKey)) {
        const c = container.controls[controlKey];
        // If it is a FormGroup, process its child controls.
        if (c instanceof FormGroup) {
          const childMessages = this.processMessages(c);
          Object.assign(messages, childMessages);
        } else {
          // Only validate if there are validation messages for the control
          if (this.validationMessages[controlKey]) {
            messages[controlKey] = '';
            if ((c.dirty || c.touched) && c.errors) {
              Object.keys(c.errors).map((messageKey) => {
                if (this.validationMessages[controlKey][messageKey]) {
                  messages[controlKey] +=
                    this.validationMessages[controlKey][messageKey] + ' ';
                }
              });
            }
          }
        }
      }
    }
    return messages;
  }

  getErrorCount(container: FormGroup): number {
    let errorCount = 0;
    for (const controlKey in container.controls) {
      if (Object.prototype.hasOwnProperty.call(container.controls, controlKey)) {
        if (container.controls[controlKey].errors) {
          if (container.controls[controlKey].errors != null) {
            const ve: ValidationErrors = container.controls[controlKey].errors;
            errorCount += Object.keys(ve).length;
          }
        }
      }
    }
    return errorCount;
  }
}
 */
export class GenericValidator {
  DisplayMessages: Record<string, string> = {};
  // Provide the set of valid validation messages
  // Structure:
  // controlName1: {
  //     validationRuleName1: 'Validation Message.',
  //     validationRuleName2: 'Validation Message.'
  // },
  // controlName2: {
  //     validationRuleName1: 'Validation Message.',
  //     validationRuleName2: 'Validation Message.'
  // }
  constructor(
    private container: FormGroup,
    private validationMessages: Record<string, Record<string, string>>
  ) {
    this.container.valueChanges.subscribe(() => {
      this.DisplayMessages = this.processMessages(this.container);
    })
  }

  private processMessages(container: FormGroup): Record<string, string> {
    const messages: Record<string, string> = {};
    for (const controlKey in container.controls) {
      if (Object.prototype.hasOwnProperty.call(container.controls, controlKey)) {
        const c = container.controls[controlKey];
        // If it is a FormGroup, process its child controls.
        if (c instanceof FormGroup) {
          const childMessages = this.processMessages(c);
          Object.assign(messages, childMessages);
        } else {
          // Only validate if there are validation messages for the control
          if (this.validationMessages[controlKey]) {
            messages[controlKey] = '';
            if ((c.dirty || c.touched) && c.errors) {
              Object.keys(c.errors).map((messageKey) => {
                if (this.validationMessages[controlKey][messageKey]) {
                  messages[controlKey] +=
                    this.validationMessages[controlKey][messageKey] + ' ';
                }
              });
            }
          }
        }
      }
    }
    return messages;
  }

  private getErrorCount(container: FormGroup): number {
    let errorCount = 0;
    for (const controlKey in container.controls) {
      if (Object.prototype.hasOwnProperty.call(container.controls, controlKey)) {
        if (container.controls[controlKey].errors) {
          if (container.controls[controlKey].errors != null) {
            const ve: ValidationErrors = container.controls[controlKey].errors;
            errorCount += Object.keys(ve).length;
          }
        }
      }
    }
    return errorCount;
  }
}
