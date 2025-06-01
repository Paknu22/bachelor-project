import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddEmployeeModalComponent } from 'src/app/Components/add-employee-modal/add-employee-modal.component';
import { AddEditCaseComponent } from 'src/app/Components/add-edit-case/add-edit-case.component';
import { AddEmployeeToCaseModalComponent } from 'src/app/Components/add-employee-to-case-modal/add-employee-to-case-modal.component';
import { ViewCaseEmployeesModalComponent } from 'src/app/Components/view-case-employees-modal/view-case-employees-modal.component';
import { EditRemoveCaseModalComponent } from 'src/app/Components/edit-remove-case-modal/edit-remove-case-modal.component';


@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalController: ModalController) { }

  async openAddEmployeeModal(addEmployeeBtnPrefab: { label: string, action: () => void}) {
    const modal = await this.modalController.create({
      component: AddEmployeeModalComponent,
      componentProps: {
        addEmployeeBtn: addEmployeeBtnPrefab
      }
    });
  
    return await modal.present();
  }

  async openAddCaseModal() {
    const modal = await this.modalController.create({
      component: AddEditCaseComponent,
      componentProps: {
        //case: addEmployeeBtnPrefab
      }
    });
  
    return await modal.present();
  }

  //For add employee to case modal
  async openAddEmployeeToCaseModal(caseId: number) {
    const modal = await this.modalController.create({
      component: AddEmployeeToCaseModalComponent,
      componentProps: {
        caseId: caseId
      }
    });
  
    return await modal.present();
  }

  //For mangage employees
  

async openViewCaseEmployeesModal(caseId: number) {
  const modal = await this.modalController.create({
    component: ViewCaseEmployeesModalComponent,
    componentProps: {
      caseId: caseId,
    },
  });

  return await modal.present();
}

//For case edit
async openEditRemoveCaseModal(caseItem: any, callbacks: { onEdit: (updatedCase: any) => void, onRemove: (caseId: number) => void }) {
  const modal = await this.modalController.create({
    component: EditRemoveCaseModalComponent,
    componentProps: {
      caseItem,
      onEdit: callbacks.onEdit,
      onRemove: callbacks.onRemove
    }
  });
  return await modal.present();
}

}
