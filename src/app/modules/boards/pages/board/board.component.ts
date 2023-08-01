import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { TodoDialogComponent } from '@boards/components/todo-dialog/todo-dialog.component';

import { ToDo, Column } from '@models/todo.model';
import { ActivatedRoute } from '@angular/router';
import { BoardsService } from '@services/boards.service';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { CardService } from '@services/card.service';
import { List } from '@models/list.model';
import { ListsService } from '@services/lists.service';
import { BACKGROUNDS } from '@models/colors.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drag-animating {
        transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {

  board: Board | null = null

  inputCard = new FormControl<string>('',{
    nonNullable: true,
    validators: [Validators.required]
  })

  inputList = new FormControl<string>('',{
    nonNullable: true,
    validators: [Validators.required]
  })

  showListFrom =  false
  colorBackgrounds = BACKGROUNDS

  constructor(
    private dialog: Dialog,
    private route: ActivatedRoute,
    private boardsService: BoardsService,
    private cardService: CardService,
    private listsService: ListsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('boardId')
      if(id){
        this.getBoard(id)
      }
    })
  }

  ngOnDestroy(): void {
    this.boardsService.setBackgroundColor('sky')
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    const position = this.boardsService.getPosition(event.container.data, event.currentIndex)
    const card = event.container.data[event.currentIndex]
    const listId = event.container.id
    this.updateCard(card, position, listId)
  }

  addList() {
    if(this.inputList.valid){
      const title = this.inputList.value
      if(this.board){
        this.listsService.create({
          title,
          boardId: this.board.id,
          position: this.boardsService.getPositionNewItem(this.board.lists)
        })
        .subscribe(list => {
          this.board?.lists.push({
            ...list,
            cards: []
          })
          this.showListFrom = true
          this.inputList.setValue('')
        })
      }
    }
  }

  openDialog(card: Card) {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      minWidth: '300px',
      maxWidth: '50%',
      data: {
        card: card,
      },
    });
    dialogRef.closed.subscribe((output) => {
      if (output) {
        console.log(output);
      }
    });
  }

  private getBoard(id:string) {
    this.boardsService.getBoard(id)
    .subscribe(board => {
      this.board = board
      this.boardsService.setBackgroundColor(this.board.backgroundColor)
    })
  }

  private updateCard(card: Card, position: number, listId: string | number){
    this.cardService.update(card.id, { position, listId })
    .subscribe((cardUpdated)=>{
      console.log(cardUpdated)
    })
  }

  openFormCard(list: List){
    //list.showCardForm= !list.showCardForm
    if(this.board?.lists){
      this.board.lists = this.board.lists.map(iteratorList => {
          return {
            ...iteratorList,
            showCardForm: iteratorList.id === list.id,
          }

      })
    }
  }

  createCard(list: List){
    if(this.inputCard.valid){
      const title = this.inputCard.value;
      if(this.board){
        this.cardService.create({
          title,
          listId: list.id,
          boardId: this.board.id,
          position: this.boardsService.getPositionNewItem(list.cards)
        }).subscribe(card => {
          list.cards.push(card);
          this.inputCard.setValue('')
          list.showCardForm = false
        })
      }
    } else {
      this.inputCard.markAllAsTouched()
    }
  }

  closeCardForm(list: List){
    list.showCardForm = false
  }

  get colors(){
    if(this.board){
      const classes = this.colorBackgrounds[this.board.backgroundColor]
      return classes ? classes : {}
    }
    return {}
  }

}
