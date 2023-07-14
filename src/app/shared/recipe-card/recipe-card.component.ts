import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Recipe } from 'src/app/models/recipe.model';
import { RecipeService } from 'src/app/services/recipe.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { map, Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent implements OnInit {
  @Input() pag: string;
  @Output() messaggio = new EventEmitter();

  ricettaForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    image: new FormControl(''),
    difficulty: new FormControl(''),
    published: new FormControl(false),
  })


  percorsoDifficolta = "../../../../assets/images/difficolta-";
  cliccato = false;
  ricette: Recipe[] = [];
  page = 1;
  ricettePerPagina = 4;

  isAdminUser: boolean = false;

  //rowsPerPageOptions: number;
  //pagingNumber = 0;
  //first: number = 0;

  ricette$: Observable<Recipe[]>;
  totRicette: Recipe[] = [];
  totale: number;

  Editor = ClassicEditor;
  editorConfig = {
    toolbar: {
        items: [
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'codeBlock',
            'imageUpload',
            'blockQuote',
            'insertTable',
            'undo',
            'redo',
        ]
    },
    image: {
        toolbar: [
            'imageStyle:full',
            'imageStyle:side',
            '|',
            'imageTextAlternative'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    height: 300,
};

  constructor(
    private recipeService: RecipeService,
    private modalService: NgbModal,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    // if(this.pag == 'home') {
    //   this.ricette$ = this.recipeService.getRecipes().pipe(
    //      map(res => res.filter(ricetteFiltrate => ricetteFiltrate.difficulty < 6 )),
    //      map(res => res.slice(0,4 )),
    //      map(res => this.totRicette = res)
    //   )
    // } else {
    //   this.ricette$ = this.recipeService.getRecipes().pipe(
    //     map(res => res.filter(ricetteFiltrate => ricetteFiltrate.difficulty < 6 )),
    //     map(res => this.totRicette = res )
    //   )
    // }

    const userRole = JSON.parse(localStorage.getItem('user')).role;
    this.isAdminUser = (userRole === 'admin');

    this.recipeService.getRecipes().subscribe({
      next: (res) => {
        this.ricette = res;
        if(this.pag == 'home'){
          this.ricette = this.ricette.sort((a,b) => b._id - a._id).reverse().slice(0,4);
          this.totRicette = this.ricette;
        } else {
          this.ricette = this.ricette.sort((a,b) => b._id - a._id).reverse();
          this.totRicette = this.ricette;
        }

      },
      error: (e) => {
        console.error(e)
      }
    })

    //this.pagine();
  }

  inviaTitolo(titolo: string){
    if(!this.cliccato){
      this.messaggio.emit(titolo);
      this.cliccato = true;
    } else {
      this.messaggio.emit('');
      this.cliccato = false;
    }
    // oppure con ternario
   // this.cliccato ? (this.messaggio.emit(''), this.cliccato = false) : (this.messaggio.emit(titolo), this.cliccato = true);
  }

    // pagine(){
    //   let tot;
    //   if(this.ricette){
    //     tot = this.ricette.length
    //   }

    //   this.page = 1;
    //   this.pagingNumber = 0;
    //   this.pagingNumber = Math.ceil(this.ricette.length / this.ricettePerPagina / 4);
    // }

    paginate(event) {
       event.page =event.page + 1;
      this.page = event.page;
  }

  openModal(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modale delete', size: 'lg', centered: true}).result
    .then((res) => {
      console.log('Azione da eseguire in caso positivo')
    }).catch((res) => {
      console.log('Nessuna azione da eseguire')
    })
  }

  eliminaRicetta(id: string) {
    this.recipeService.deleteRecipe(id).subscribe({
      next: (res) => {
        console.log('Ricetta eliminata', res)
      },
      error: (err) => console.log(err)
    });
    window.location.reload();
    // this.cdRef.detectChanges();
  }

  pubblicaRicetta(id: string) {
    this.recipeService.getRecipe(id).subscribe({
      next: (ricetta) => {
        ricetta.published = !ricetta.published;
        this.recipeService.publishRecipe(id, ricetta).subscribe({
          next: (res) => {
            this.messageService.add({severity: 'success', summary: 'Successo', detail: 'Visibilità modificata con successo', life: 3000});
            console.log('Ricetta pubblicata', res);
          },
          error: (err) => {
            this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore nella modifica della visibilità', life: 3000});
            console.log(err)
          }
        });
      },
      error: (err) =>{
        this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore nella modifica della visibilità', life: 3000});
        console.log(err)
      }
    });
    window.location.reload();
    // this.cdRef.detectChanges();
  }


  // modificaRicetta(id: string) {
  //   this.recipeService.getRecipe(id).subscribe({
  //     next: (ricetta) => {
  //       if (this.ricettaForm.value.title !== '')
  //       ricetta.title = this.ricettaForm.value.title;
  //       if (this.ricettaForm.value.description !== '')
  //       ricetta.description = this.ricettaForm.value.description;
  //       if (this.ricettaForm.value.image !== '')
  //       ricetta.image = this.ricettaForm.value.image;
  //       if (this.ricettaForm.value.difficulty !== '')
  //       ricetta.difficulty = Number(this.ricettaForm.value.difficulty);
  //       if (this.ricettaForm.value.published !== false)
  //       ricetta.published = this.ricettaForm.value.published;
  //       var ricettaNuova = {
  //         title: ricetta.title,
  //         description: ricetta.description,
  //         image: ricetta.image,
  //         difficulty: ricetta.difficulty,
  //         published: ricetta.published,
  //       }
  //       this.recipeService.publishRecipe(id, ricettaNuova).subscribe({
  //         next: (res) => {
  //           this.messageService.add({severity: 'success', summary: 'Successo', detail: 'Ricetta modificata con successo', life: 3000});
  //           console.log('Ricetta modificata', res);
  //         },
  //         error: (err) => {
  //           this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore nella modifica della ricetta', life: 3000});
  //           console.log(err)
  //         }
  //       });
  //     },
  //     error: (err) =>{
  //       this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore nella modifica della ricetta', life: 3000});
  //       console.log(err)
  //     }
  //   });
  //   window.location.reload();
  //   // this.cdRef.detectChanges();
  // }

  modificaRicetta(id: string) {
    this.recipeService.getRecipe(id).subscribe({
      next: (ricetta) => {
        for (const key in this.ricettaForm.value) {
          if (this.ricettaForm.value.hasOwnProperty(key)) {
            const formValue = this.ricettaForm.value[key];
            if (formValue !== '') {
              ricetta[key] = formValue;
            }
          }
        }
        this.recipeService.publishRecipe(id, ricetta).subscribe({
          next: (res) => {
            this.messageService.add({severity: 'success', summary: 'Successo', detail: 'Ricetta modificata con successo', life: 3000});
            console.log('Ricetta modificata', res);
          },
          error: (err) => {
            this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore nella modifica della ricetta', life: 3000});
            console.log(err)
          }
        });
      },
      error: (err) =>{
        this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore nella modifica della ricetta', life: 3000});
        console.log(err)
      }
    });
    window.location.reload();
    // this.cdRef.detectChanges();
  }


  salvaRicetta() {

  }

}
