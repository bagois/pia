import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalsService } from 'app/modals/modals.service';
import { Measure } from './measure.model';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit {

  @Input() measure: Measure;
  @Input() item: any;
  @Input() section: any;
  @Input() pia: any;
  displayEditButton = false;
  displayDeleteButton = false;
  measureForm: FormGroup;
  measureModel: Measure = new Measure();

  constructor(
    private el: ElementRef,
    private _modalsService: ModalsService,
    private _evaluationService: EvaluationService) { }

  ngOnInit() {
    this.measureForm = new FormGroup({
      measureTitle: new FormControl(),
      measureContent: new FormControl()
    });
    this.measureModel.get(this.measure.id).then(() => {
      if (this.measureModel) {
        this.measureForm.controls['measureTitle'].patchValue(this.measureModel.title);
        this.measureForm.controls['measureContent'].patchValue(this.measureModel.content);
        if (this.measureModel.title || this.measureModel.content) {
          this.displayEditButton = true;
          this.displayDeleteButton = true;
        }
        if (this.measureModel.title) {
          this.measureForm.controls['measureTitle'].disable();
        }
        if (this.measureModel.content) {
          this.measureForm.controls['measureContent'].disable();
        }
      }
    });
  }

  /**
   * Disables title field when losing focus from it.
   * Shows measure edit button.
   * Saves data from title field.
   * @param {event} event any event.
   */
  measureTitleFocusOut(event) {
    const titleValue = this.measureForm.value.measureTitle;
    const contentValue = this.measureForm.value.measureContent;

    // Waiting for document.activeElement update
    setTimeout(() => {
      this.measureModel.title = titleValue;
      this.measureModel.update().then(() => {
        this._evaluationService.allowEvaluation();
      });
      if (titleValue && titleValue.length > 0 && document.activeElement.id !== 'pia-measure-content-' + this.measureModel.id) {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureTitle'].disable();
        // Disables content field if both fields are filled and content isn't the next targeted element.
        if (contentValue && contentValue.length > 0) {
          this.measureForm.controls['measureContent'].disable();
        }
      }
      // Disables content field too if no title and content is filled and isn't the next targeted element.
      if (!titleValue && contentValue && contentValue.length > 0 && document.activeElement.id !== 'pia-measure-content') {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureContent'].disable();
      }
    }, 1);
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   * @param {event} event any event.
   */
  measureContentFocusOut(event) {
    const titleValue = this.measureForm.value.measureTitle;
    const contentValue = this.measureForm.value.measureContent;

    // Waiting for document.activeElement update
    setTimeout(() => {
      this.measureModel.content = contentValue;
      this.measureModel.update().then(() => {
        this._evaluationService.allowEvaluation();
      });
      if (contentValue && contentValue.length > 0 && document.activeElement.id !== 'pia-measure-title-' + this.measureModel.id) {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureContent'].disable();
        // Disables title field if both fields are filled and title isn't the next targeted element.
        if (titleValue && titleValue.length > 0) {
          this.measureForm.controls['measureTitle'].disable();
        }
      }
      // Disables content field too if no title and content is filled and isn't the next targeted element.
      if (!contentValue && contentValue && titleValue.length > 0 && document.activeElement.id !== 'pia-measure-title') {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureTitle'].disable();
      }
    }, 1);
  }

  /**
   * Enables or disables edition mode (fields) for measures.
   */
  activateMeasureEdition() {
    this.displayEditButton = false;
    this.measureForm.enable();
  }

  /**
   * Shows or hides a measure.
   */
  displayMeasure() {
    const accordeon = this.el.nativeElement.querySelector('.pia-measureBlock-title button span');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-measureBlock-displayer');
    displayer.classList.toggle('close');
  }

  /**
   * Allows an user to remove a measure.
   */
  removeMeasure(measureID: string) {
    const measuresCount = document.querySelectorAll('.pia-measureBlock');
    if (measuresCount && measuresCount.length <= 1) {
      this._modalsService.openModal('not-enough-measures-to-remove');
    } else {
      localStorage.setItem('measure-id', measureID);
      this._modalsService.openModal('remove-measure');
    }
  }

}
