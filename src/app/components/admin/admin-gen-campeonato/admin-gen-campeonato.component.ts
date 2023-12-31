import { Component, OnInit } from '@angular/core';
import { EquipoService } from 'src/app/service/api/equipo.service';
import { Equipo } from 'src/app/models/Equipo';
import { Encuentros } from 'src/app/models/Encuentros';
import { Fase_Encuentros } from 'src/app/models/Fase_Encuentros';
import { Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';
import { CampeonatoService } from 'src/app/service/api/campeonato.service';
import { EncuentrosService } from 'src/app/service/api/encuentros.service';
import { ViewEncuentrosFase } from 'src/app/models/ViewEncuentrosFase';
import { elementAt } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Campeonato } from 'src/app/models/Campeonato';
import { Tabla_Posiciones } from 'src/app/models/Tabla_Posiciones';
import { PosicionesService } from 'src/app/service/api/posiciones.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-gen-campeonato',
  templateUrl: './admin-gen-campeonato.component.html',
  styleUrls: ['./admin-gen-campeonato.component.css']
})
export class AdminGenCampeonatoComponent implements OnInit {
  protected apiUrlImg: string = environment.apiUrlImg;
  showModal = false;
  showModalCargando = false;
  showModalNULL = false;
  showModalError = false;
  showModalEncuentros = false;
  EquipoArray: any[] = [];
  ViewEncuentros: any[] = [];
  EncuentrosArray1: any[] = [];
  EncuentrosArray2: any[] = [];
  EncuentrosArray3: any[] = [];
  EncuentrosArray4: any[] = [];
  EncuentrosArray5: any[] = [];
  EquipoArrayGrupos: any[] = [];
  CampeonatoArray: any[] = [];
  isResultLoaded = false;
  opcionSeleccionada!: string;
  name_camp!: string;
  numGroupsSelected: string = '';
  numGrupo: number = 0;
  EquipoSelected: Equipo = new Equipo('', '', '', '', '', '');
  copiaEquipoArrayGrupos!: Equipo[];
  grupo1: Equipo[] = [];
  grupo2: Equipo[] = [];
  grupo3: Equipo[] = [];
  grupo4: Equipo[] = [];
  grupo5: Equipo[] = [];
  errorValidacion: string = "";
  numGrupoRecomendado: string = "";

  constructor(private ts: EquipoService, private tsC: CampeonatoService, private tsE: EncuentrosService, private tsT: PosicionesService, private toastr: ToastrService) {
    this.tsC.getAllCampeonato().subscribe((resultData: any) => {
      this.isResultLoaded = true;
      // Filtrar campeonatos con estado en true
      this.CampeonatoArray = resultData.filter((campeonato: any) => campeonato.estado === true);
    });
    this.opcionSeleccionada = '';
  }

  ngOnInit() {

  }


  onSelect(event: any) {
    this.numGroupsSelected = event.target.value;
  }

  onSelectCampeonato(event: any) {
    this.opcionSeleccionada = event.target.value;
    if (this.opcionSeleccionada != null) {
      const campeonato = this.CampeonatoArray.find((campeonato) => campeonato.pk_idcamp === this.opcionSeleccionada);
      this.name_camp = campeonato.name_camp;
      this.ts.getAllEquipo().subscribe((resultData: any) => {
        this.isResultLoaded = true;
        this.EquipoArray = resultData.filter((equipo: any) => equipo.fk_idcamp === this.opcionSeleccionada);
        this.EquipoArrayGrupos = resultData.filter((equipo: any) => equipo.fk_idcamp === this.opcionSeleccionada);
        this.copiaEquipoArrayGrupos = [...this.EquipoArrayGrupos];
        this.recomendacionGrupos();
      });
    }
  }

  recomendacionGrupos() {
    const numG = this.copiaEquipoArrayGrupos.length;
    if (numG >= 15 && numG <= 20) {
      this.numGrupoRecomendado = '5';
    } else {
      if (numG >= 12 && numG <= 16) {
        this.numGrupoRecomendado = '4';
      } else {
        if (numG >= 9 && numG <= 12) {
          this.numGrupoRecomendado = '3';
        } else {
          if (numG >= 6 && numG <= 8) {
            this.numGrupoRecomendado = '2';
          } else {
            this.numGrupoRecomendado = 'Fuera del campo asigando'
          }
        }
      }
    }
  }

  validarSorteArrayEquipos() {
    if (this.numGroupsSelected != '' && this.EquipoArrayGrupos.length != 0) {
      /* SORTEO
      2 grupos    3 grupos    4 grupos    5 grupos
      - minimo 6  - minimo 9  - minimo 12 - minimo 15
      - maximo 8  - maximo 12 - maximo 16 - maximo 20*/
      if (this.numGroupsSelected == '2') {
        if (this.numGrupo === 2) { this.numGrupo = 0 }
        if (this.EquipoArrayGrupos.length >= 6 && this.EquipoArrayGrupos.length <= 8) {
          if (this.copiaEquipoArrayGrupos.length === 0) {
            this.openModalNULL();
            this.numGrupo = 0;
          } else {
            const indiceAleatorio = Math.floor(Math.random() * this.copiaEquipoArrayGrupos.length);
            const datoAleatorio = this.copiaEquipoArrayGrupos[indiceAleatorio];
            this.copiaEquipoArrayGrupos.splice(indiceAleatorio, 1);
            this.EquipoSelected = new Equipo(datoAleatorio.pk_idequ, datoAleatorio.nom_equ, datoAleatorio.logo, datoAleatorio.semestre, datoAleatorio.representante, datoAleatorio.fk_idcamp);
            this.openModal();
            this.numGrupo++;

            if (this.numGrupo == 1) {
              this.grupo1.push(this.EquipoSelected);
            }
            if (this.numGrupo == 2) {
              this.grupo2.push(this.EquipoSelected);
            }
          }
        } else {
          this.errorValidacion = "Los equipos no son suficientes para formar los grupos";
          this.showModalError = true;
        }
      }
      if (this.numGroupsSelected == '3') {
        if (this.numGrupo === 3) { this.numGrupo = 0 }
        if (this.EquipoArrayGrupos.length >= 9 && this.EquipoArrayGrupos.length <= 12) {
          if (this.copiaEquipoArrayGrupos.length === 0) {
            this.openModalNULL();
            this.numGrupo = 0;
          } else {
            const indiceAleatorio = Math.floor(Math.random() * this.copiaEquipoArrayGrupos.length);
            const datoAleatorio = this.copiaEquipoArrayGrupos[indiceAleatorio];
            this.copiaEquipoArrayGrupos.splice(indiceAleatorio, 1);
            this.EquipoSelected = new Equipo(datoAleatorio.pk_idequ, datoAleatorio.nom_equ, datoAleatorio.logo, datoAleatorio.semestre, datoAleatorio.representante, datoAleatorio.fk_idcamp,);
            this.openModal();
            this.numGrupo++;
            if (this.numGrupo == 1) {
              this.grupo1.push(this.EquipoSelected);

            }
            if (this.numGrupo == 2) {
              this.grupo2.push(this.EquipoSelected);

            }
            if (this.numGrupo == 3) {
              this.grupo3.push(this.EquipoSelected);
            }
          }
        } else {
          this.errorValidacion = "Los equipos no son suficientes para formar los grupos";
          this.showModalError = true;
        }
      }
      if (this.numGroupsSelected == '4') {
        if (this.numGrupo === 4) { this.numGrupo = 0 }
        if (this.EquipoArrayGrupos.length >= 12 && this.EquipoArrayGrupos.length <= 16) {
          if (this.copiaEquipoArrayGrupos.length === 0) {
            this.openModalNULL();
            this.numGrupo = 0;
          } else {
            const indiceAleatorio = Math.floor(Math.random() * this.copiaEquipoArrayGrupos.length);
            const datoAleatorio = this.copiaEquipoArrayGrupos[indiceAleatorio];
            this.copiaEquipoArrayGrupos.splice(indiceAleatorio, 1);
            this.EquipoSelected = new Equipo(datoAleatorio.pk_idequ, datoAleatorio.nom_equ, datoAleatorio.logo, datoAleatorio.semestre, datoAleatorio.representante, datoAleatorio.fk_idcamp,);
            this.openModal();
            this.numGrupo++;
            if (this.numGrupo == 1) {
              this.grupo1.push(this.EquipoSelected);

            }
            if (this.numGrupo == 2) {
              this.grupo2.push(this.EquipoSelected);

            }
            if (this.numGrupo == 3) {
              this.grupo3.push(this.EquipoSelected);

            }
            if (this.numGrupo == 4) {
              this.grupo4.push(this.EquipoSelected);
            }
          }
        } else {
          this.errorValidacion = "Los equipos no son suficientes para formar los grupos";
          this.showModalError = true;
        }
      }
      if (this.numGroupsSelected == '5') {
        if (this.numGrupo === 5) { this.numGrupo = 0 }
        if (this.EquipoArrayGrupos.length >= 15 && this.EquipoArrayGrupos.length <= 20) {
          if (this.copiaEquipoArrayGrupos.length === 0) {
            this.openModalNULL();
            this.numGrupo = 0;
          } else {
            const indiceAleatorio = Math.floor(Math.random() * this.copiaEquipoArrayGrupos.length);
            const datoAleatorio = this.copiaEquipoArrayGrupos[indiceAleatorio];
            this.copiaEquipoArrayGrupos.splice(indiceAleatorio, 1);
            this.EquipoSelected = new Equipo(datoAleatorio.pk_idequ, datoAleatorio.nom_equ, datoAleatorio.logo, datoAleatorio.semestre, datoAleatorio.representante, datoAleatorio.fk_idcamp,);
            this.openModal();
            this.numGrupo++;
            if (this.numGrupo == 1) {
              this.grupo1.push(this.EquipoSelected);

            }
            if (this.numGrupo == 2) {
              this.grupo2.push(this.EquipoSelected);

            }
            if (this.numGrupo == 3) {
              this.grupo3.push(this.EquipoSelected);

            }
            if (this.numGrupo == 4) {
              this.grupo4.push(this.EquipoSelected);
            }
            if (this.numGrupo == 5) {
              this.grupo5.push(this.EquipoSelected);
            }
          }
        } else {
          this.errorValidacion = "Los equipos no son suficientes para formar los grupos";
          this.showModalError = true;
        }
      }

    } else {
      this.errorValidacion = "Seleccione el numero de grupo y el campeonato";
      this.showModalError = true;
    }

  }

  limpiarGrupos() {
    this.copiaEquipoArrayGrupos = [...this.EquipoArrayGrupos];
    this.numGroupsSelected = '';
    this.grupo1.splice(0);
    this.grupo2.splice(0);
    this.grupo3.splice(0);
    this.grupo4.splice(0);
    this.grupo5.splice(0);
    this.numGrupo = 0;
  }

  generarEncuentros() {
    let contador = 0;
    if (this.numGroupsSelected !== '') {
      this.showModalCargando = true;
      while (contador < parseInt(this.numGroupsSelected)) {
        if (contador == 0) {

          if (this.grupo1.length == 3) {
            this.gruposTres(1, this.grupo1[0], this.grupo1[1], this.grupo1[2], 1);
            /* Tabla de Posiciones */
            const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo1[0].fk_idcamp, 1, this.grupo1[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo1[1].fk_idcamp, 1, this.grupo1[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo1[2].fk_idcamp, 1, this.grupo1[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            this.tsT.addPosiciones(tabla_pos1).subscribe();
            this.tsT.addPosiciones(tabla_pos2).subscribe();
            this.tsT.addPosiciones(tabla_pos3).subscribe();
          }
          if (this.grupo1.length == 4) {
            this.gruposCuatro(1, this.grupo1[0], this.grupo1[1], this.grupo1[2], this.grupo1[3], 1);
            /* Tabla de Posiciones */
            const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo1[0].fk_idcamp, 1, this.grupo1[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo1[1].fk_idcamp, 1, this.grupo1[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo1[2].fk_idcamp, 1, this.grupo1[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            const tabla_pos4 = new Tabla_Posiciones(uuidv4(), this.grupo1[3].fk_idcamp, 1, this.grupo1[3].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            this.tsT.addPosiciones(tabla_pos1).subscribe();
            this.tsT.addPosiciones(tabla_pos2).subscribe();
            this.tsT.addPosiciones(tabla_pos3).subscribe();
            this.tsT.addPosiciones(tabla_pos4).subscribe();
          }

        } else {
          if (contador == 1) {
            if (this.grupo2.length == 3) {
              this.gruposTres(1, this.grupo2[0], this.grupo2[1], this.grupo2[2], 2);
              /* Tabla de Posiciones */
              const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo2[0].fk_idcamp, 1, this.grupo2[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 2);
              const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo2[1].fk_idcamp, 1, this.grupo2[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 2);
              const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo2[2].fk_idcamp, 1, this.grupo2[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 2);
              this.tsT.addPosiciones(tabla_pos1).subscribe();
              this.tsT.addPosiciones(tabla_pos2).subscribe();
              this.tsT.addPosiciones(tabla_pos3).subscribe();
            }
            if (this.grupo2.length == 4) {
              this.gruposCuatro(1, this.grupo2[0], this.grupo2[1], this.grupo2[2], this.grupo2[3], 2);
              /* Tabla de Posiciones */
              const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo2[0].fk_idcamp, 1, this.grupo2[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 2);
              const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo2[1].fk_idcamp, 1, this.grupo2[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 2);
              const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo2[2].fk_idcamp, 1, this.grupo2[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 2);
              const tabla_pos4 = new Tabla_Posiciones(uuidv4(), this.grupo2[3].fk_idcamp, 1, this.grupo2[3].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 2);
              this.tsT.addPosiciones(tabla_pos1).subscribe();
              this.tsT.addPosiciones(tabla_pos2).subscribe();
              this.tsT.addPosiciones(tabla_pos3).subscribe();
              this.tsT.addPosiciones(tabla_pos4).subscribe();
            }
          } else {
            if (contador == 2) {
              if (this.grupo3.length == 3) {
                this.gruposTres(1, this.grupo3[0], this.grupo3[1], this.grupo3[2], 3);
                /* Tabla de Posiciones */
                const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo3[0].fk_idcamp, 1, this.grupo3[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 3);
                const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo3[1].fk_idcamp, 1, this.grupo3[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 3);
                const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo3[2].fk_idcamp, 1, this.grupo3[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 3);
                this.tsT.addPosiciones(tabla_pos1).subscribe();
                this.tsT.addPosiciones(tabla_pos2).subscribe();
                this.tsT.addPosiciones(tabla_pos3).subscribe();
              }
              if (this.grupo3.length == 4) {
                this.gruposCuatro(1, this.grupo3[0], this.grupo3[1], this.grupo3[2], this.grupo3[3], 3);
                /* Tabla de Posiciones */
                const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo3[0].fk_idcamp, 1, this.grupo3[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 3);
                const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo3[1].fk_idcamp, 1, this.grupo3[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 3);
                const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo3[2].fk_idcamp, 1, this.grupo3[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 3);
                const tabla_pos4 = new Tabla_Posiciones(uuidv4(), this.grupo3[3].fk_idcamp, 1, this.grupo3[3].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 3);
                this.tsT.addPosiciones(tabla_pos1).subscribe();
                this.tsT.addPosiciones(tabla_pos2).subscribe();
                this.tsT.addPosiciones(tabla_pos3).subscribe();
                this.tsT.addPosiciones(tabla_pos4).subscribe();
              }
            } else {
              if (contador == 3) {
                if (this.grupo4.length == 3) {
                  this.gruposTres(1, this.grupo4[0], this.grupo4[1], this.grupo4[2], 4);
                  /* Tabla de Posiciones */
                  const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo4[0].fk_idcamp, 1, this.grupo4[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 4);
                  const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo4[1].fk_idcamp, 1, this.grupo4[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 4);
                  const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo4[2].fk_idcamp, 1, this.grupo4[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 4);
                  this.tsT.addPosiciones(tabla_pos1).subscribe();
                  this.tsT.addPosiciones(tabla_pos2).subscribe();
                  this.tsT.addPosiciones(tabla_pos3).subscribe();
                }
                if (this.grupo4.length == 4) {
                  this.gruposCuatro(1, this.grupo4[0], this.grupo4[1], this.grupo4[2], this.grupo4[3], 4);
                  /* Tabla de Posiciones */
                  const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo4[0].fk_idcamp, 1, this.grupo4[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 4);
                  const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo4[1].fk_idcamp, 1, this.grupo4[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 4);
                  const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo4[2].fk_idcamp, 1, this.grupo4[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 4);
                  const tabla_pos4 = new Tabla_Posiciones(uuidv4(), this.grupo4[3].fk_idcamp, 1, this.grupo4[3].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 4);
                  this.tsT.addPosiciones(tabla_pos1).subscribe();
                  this.tsT.addPosiciones(tabla_pos2).subscribe();
                  this.tsT.addPosiciones(tabla_pos3).subscribe();
                  this.tsT.addPosiciones(tabla_pos4).subscribe();
                }
              } else {
                if (contador == 4) {
                  if (this.grupo5.length == 3) {
                    this.gruposTres(1, this.grupo5[0], this.grupo5[1], this.grupo5[2], 5);
                    /* Tabla de Posiciones */
                    const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo5[0].fk_idcamp, 1, this.grupo5[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 5);
                    const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo5[1].fk_idcamp, 1, this.grupo5[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 5);
                    const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo5[2].fk_idcamp, 1, this.grupo5[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 5);
                    this.tsT.addPosiciones(tabla_pos1).subscribe();
                    this.tsT.addPosiciones(tabla_pos2).subscribe();
                    this.tsT.addPosiciones(tabla_pos3).subscribe();
                  }
                  if (this.grupo5.length == 4) {
                    this.gruposCuatro(1, this.grupo5[0], this.grupo5[1], this.grupo5[2], this.grupo5[3], 5);
                    /* Tabla de Posiciones */
                    const tabla_pos1 = new Tabla_Posiciones(uuidv4(), this.grupo5[0].fk_idcamp, 1, this.grupo5[0].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 5);
                    const tabla_pos2 = new Tabla_Posiciones(uuidv4(), this.grupo5[1].fk_idcamp, 1, this.grupo5[1].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 5);
                    const tabla_pos3 = new Tabla_Posiciones(uuidv4(), this.grupo5[2].fk_idcamp, 1, this.grupo5[2].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 5);
                    const tabla_pos4 = new Tabla_Posiciones(uuidv4(), this.grupo5[3].fk_idcamp, 1, this.grupo5[3].pk_idequ, 0, 0, 0, 0, 0, 0, 0, 0, 5);
                    this.tsT.addPosiciones(tabla_pos1).subscribe();
                    this.tsT.addPosiciones(tabla_pos2).subscribe();
                    this.tsT.addPosiciones(tabla_pos3).subscribe();
                    this.tsT.addPosiciones(tabla_pos4).subscribe();
                  }
                }
              }
            }
          }
        }
        contador++;
      }
      /* View Encuentros */
      this.tsE.getAllViewEncuentrosByCamp(this.name_camp).subscribe((resultData: any) => {
        this.isResultLoaded = true;
        this.ViewEncuentros = resultData;
        this.showModalCargando = false;
        this.showModalEncuentros = true;
      });
    } else {
      this.toastr.error('Por favor, complete todos los campos para poder generar los encuentros!', 'Equipo!');
    }
  }

  gruposTres(fase: any, grupo1: any, grupo2: any, grupo3: any, numGrupo: number) {
    const newEncuentro1 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo1.pk_idequ, fase, 0, grupo2.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    const newEncuentro2 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo1.pk_idequ, fase, 0, grupo3.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    const newEncuentro3 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo2.pk_idequ, fase, 0, grupo3.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    this.tsE.addEncuentros(newEncuentro1).subscribe();
    this.tsE.addEncuentros(newEncuentro2).subscribe();
    this.tsE.addEncuentros(newEncuentro3).subscribe();
  }

  gruposCuatro(fase: any, grupo1: any, grupo2: any, grupo3: any, grupo4: any, numGrupo: number) {
    const newEncuentro1 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo1.pk_idequ, fase, 0, grupo2.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    const newEncuentro2 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo3.pk_idequ, fase, 0, grupo4.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    const newEncuentro3 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo1.pk_idequ, fase, 0, grupo3.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    const newEncuentro4 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo2.pk_idequ, fase, 0, grupo4.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    const newEncuentro5 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo1.pk_idequ, fase, 0, grupo4.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    const newEncuentro6 = new Encuentros(uuidv4(), this.opcionSeleccionada, grupo2.pk_idequ, fase, 0, grupo3.pk_idequ, 0, 'UTMACH', new Date(), 'Proximo', numGrupo);
    this.tsE.addEncuentros(newEncuentro1).subscribe();
    this.tsE.addEncuentros(newEncuentro2).subscribe();
    this.tsE.addEncuentros(newEncuentro3).subscribe();
    this.tsE.addEncuentros(newEncuentro4).subscribe();
    this.tsE.addEncuentros(newEncuentro5).subscribe();
    this.tsE.addEncuentros(newEncuentro6).subscribe();
  }

  openModal() {
    this.showModal = true;
    const openModal = document.querySelector('.ins');
    const modal = document.querySelector('.modal');
    const closeModal = document.querySelector('.modal-close');

    openModal?.addEventListener('click', (e) => {
      e.preventDefault();
      modal?.classList.add('modal--show');
    });

    closeModal?.addEventListener('click', (e) => {
      e.preventDefault();
      modal?.classList.remove('modal--show');
    });
  }

  closeModal() {
    this.showModal = false;
    this.EquipoSelected = new Equipo('', '', '', '', '', '');
  }

  openModalNULL() {
    this.showModalNULL = true;
    const openModal = document.querySelector('.ins');
    const modal = document.querySelector('.modal');
    const closeModal = document.querySelector('.modal-close');

    openModal?.addEventListener('click', (e) => {
      e.preventDefault();
      modal?.classList.add('modal--show');
    });

    closeModal?.addEventListener('click', (e) => {
      e.preventDefault();
      modal?.classList.remove('modal--show');
    });
  }

  closeModalNULL() {
    this.showModalNULL = false;
    this.EquipoSelected = new Equipo('', '', '', '', '', '');
  }

  closeModalError() {
    this.showModalError = false;
  }

  closeModalEncuentros() {
    this.showModalEncuentros = false;
    this.limpiarGrupos();
  }
}
