/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  recognition: SpeechRecognition | undefined;;
  isStoppedSpeechRecog = false;
  lastActive: number | undefined;

  public text = '';
  public speechInput$: Subject<string> = new Subject();
  public speechActive$: ReplaySubject<boolean> = new ReplaySubject();
  private tempWords = '';

  /**
   * @description Function to initialize voice recognition.
   */
  init(grammar: string | undefined) {
    if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();

      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      if (grammar) {
        const grammarList = new webkitSpeechGrammarList();
        grammarList.addFromString(grammar, 1);
        this.recognition.grammars = grammarList;
      }

      this.recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        this.tempWords = transcript;
        //      this.speechInput$.next(this.text || transcript);
      };
    }
    return this.initListeners();
  }

  /**
   * @description Add event listeners to get the updated input and when stoped
   */
  initListeners() {
    if (this.recognition) {
      this.recognition.onstart = () => {
        if (this.lastActive === undefined) {
          this.speechActive$.next(true);
        }
      };
    }
  }

  /**
   * @description Function to mic on to listen.
   */
  start() {
    this.text = '';
    this.isStoppedSpeechRecog = false;
    if (this.recognition) {
      this.recognition.start();
      this.lastActive = undefined;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.recognition.onend = (_condition: any) => {
        if (this.isStoppedSpeechRecog) {
          //        this.recognition.isActive = true;
          this.lastActive = undefined;
          this.speechActive$.next(false);
        } else {
          this.wordConcat();
          // Checked time with last api call made time so we can't have multiple start action within 200ms for countinious listening
          // Fixed : ERROR DOMException: Failed to execute 'start' on 'SpeechRecognition': recognition has already started.
          if (!this.lastActive || Date.now() - this.lastActive > 200) {
            this.lastActive = Date.now();
            this.recognition?.start();
          }
        }
      }
      if (this.text !== '') {
        this.speechInput$.next(this.text);
      }
    };
  }

  /**
   * @description Function to stop recognition.
   */
  stop() {
    this.text = '';
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition?.abort();
  }

  /**
   * @description Merge previous input with latest input.
   */
  wordConcat() {
    this.text = this.tempWords;
    this.text = this.text.trim();
    this.tempWords = '';
  }
}
