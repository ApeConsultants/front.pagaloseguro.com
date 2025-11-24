import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AbonosService } from '../../../../core/services/abonos.service';
import { CicloService } from '../../../../core/services/ciclo.service';
import { UserService } from '../../../../core/services/user.service';

interface AdminKpis {
  ciclosActivos: number;
  usuariosTotal: number;
  recaudacionSemana: number;
  moras: number;
}

interface TopAhorrador {
  nombre: string;
  monto: number;
}

interface RolResumen {
  rol: string;
  total: number;
}

interface EstadoChartItem {
  key: string;
  label: string;
  count: number;
  percent: number;
}

interface CicloOption {
  id: string;
  nombre: string;
}

interface ActividadReciente {
  usuario: string;
  rol: string;
  titulo: string;
  descripcion: string;
  fecha: Date | null;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
})
export class DashboardAdminComponent implements OnInit {
  loading = true;
  error: string | null = null;

  kpis: AdminKpis = {
    ciclosActivos: 0,
    usuariosTotal: 0,
    recaudacionSemana: 0,
    moras: 0,
  };

  // Datos principales
  topAhorradores: TopAhorrador[] = [];
  resumenRoles: RolResumen[] = [];
  statusChart: EstadoChartItem[] = [];
  notas: string[] = [];

  // Filtros Top Ahorradores
  ciclosLista: CicloOption[] = [];
  selectedCicloId: string = 'todos';
  usuarioFiltro: 'activos' | 'todos' = 'activos';

  // Actividad reciente
  actividadesRecientes: ActividadReciente[] = [];

  // Copias crudas
  abonosRaw: any[] = [];
  usuariosRaw: any[] = [];

  // Eje Y (porcentajes) y popup de barras
  // 100 arriba, 0 hasta abajo
  yTicks: number[] = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
  selectedStatusKey: string | null = null;

  constructor(
    private abonosService: AbonosService,
    private cicloService: CicloService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      ciclos: this.cicloService
        .getListaCiclos()
        .pipe(catchError(() => of(null))),
      usuarios: this.userService
        .getListaUsuarios()
        .pipe(catchError(() => of({ data: [] }))),
      abonos: this.abonosService
        .getAbonosLista()
        .pipe(catchError(() => of({ data: [] }))),
    }).subscribe({
      next: ({ ciclos, usuarios, abonos }) => {
        const usuariosArr = Array.isArray(usuarios?.data)
          ? usuarios.data
          : Array.isArray(usuarios)
          ? usuarios
          : [];

        const abonosArr = Array.isArray(abonos?.data)
          ? abonos.data
          : Array.isArray(abonos)
          ? abonos
          : [];

        this.usuariosRaw = usuariosArr;
        this.abonosRaw = abonosArr;

        // === Ciclos para filtro ===
        this.ciclosLista = [];
        let ciclosArr: any[] = [];
        if (Array.isArray(ciclos?.data)) {
          ciclosArr = ciclos.data;
        } else if (Array.isArray(ciclos)) {
          ciclosArr = ciclos;
        }

        this.ciclosLista = (ciclosArr || [])
          .map((c: any) => {
            const id = String(
              c.id ?? c.id_ciclo ?? c.cve_ciclo ?? c.clave ?? ''
            ).trim();
            if (!id) return null;
            const nombre =
              c.nombre ?? c.descripcion ?? c.nombre_ciclo ?? `Ciclo ${id}`;
            return { id, nombre } as CicloOption;
          })
          .filter((c: CicloOption | null): c is CicloOption => !!c);

        // === KPIs ===
        this.kpis.usuariosTotal = usuariosArr.length;
        this.kpis.ciclosActivos = ciclos?.data?.actual ? 1 : 0;

        const now = new Date();
        const weekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000; // últimos 7 días

        let recaudacionSemana = 0;
        let moras = 0;

        const statusCounts: Record<string, number> = {};

        abonosArr.forEach((a: any) => {
          const status = (a.status || '').toUpperCase();
          statusCounts[status] = (statusCounts[status] || 0) + 1;

          const createdAt = this.parseDate(a.fe_create);
          const monto = Number(a.monto_abono || 0);

          // Recaudación últimos 7 días (solo conciliados)
          if (
            createdAt &&
            createdAt.getTime() >= weekAgoMs &&
            status === 'CONCILIADO'
          ) {
            recaudacionSemana += monto;
          }

          // Moras: pendientes, abiertos (históricos) o rechazados
          if (
            status === 'PENDIENTE' ||
            status === 'ABIERTO' ||
            status === 'RECHAZADO'
          ) {
            moras++;
          }
        });

        this.kpis.recaudacionSemana = recaudacionSemana;
        this.kpis.moras = moras;

        // === Resumen por rol ===
        const roleCounts: Record<string, number> = {};
        usuariosArr.forEach((u: any) => {
          const rawRol = u.tipo_usuario ?? u.tipo ?? u.rol ?? 'otro';
          const displayRol = this.mapRolDisplay(String(rawRol));
          roleCounts[displayRol] = (roleCounts[displayRol] || 0) + 1;
        });
        this.resumenRoles = Object.entries(roleCounts).map(([rol, total]) => ({
          rol,
          total: total as number,
        }));

        // === Gráfica de estados (sin ABIERTO) ===
        const estados = ['CONCILIADO', 'PENDIENTE', 'RECHAZADO'];

        // Total solo de los estados considerados en la gráfica
        const totalEstados =
          estados.reduce((sum, key) => sum + (statusCounts[key] || 0), 0) || 1;

        this.statusChart = estados.map((key) => {
          const count = statusCounts[key] || 0;
          const percent = Math.round((count / totalEstados) * 100);
          const label =
            key === 'CONCILIADO'
              ? 'Conciliado'
              : key === 'PENDIENTE'
              ? 'Pendiente'
              : 'Rechazado';

          return { key, label, count, percent };
        });

        // === Actividad reciente ===
        this.buildActividadesRecientes(abonosArr);

        // === Top Ahorradores (usar filtros actuales) ===
        this.recalcularTopAhorradores();

        // === Notas importantes ===
        this.buildNotes();

        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la información del dashboard.';
        this.loading = false;
      },
    });
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date((value as string).replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }

  private buildNotes(): void {
    const notes: string[] = [];

    if (this.kpis.moras > 0) {
      notes.push(
        `Hay ${this.kpis.moras} abonos en mora (pendientes o rechazados).`
      );
    }
    if (this.kpis.recaudacionSemana === 0) {
      notes.push('No hay recaudación registrada en los últimos 7 días.');
    }
    if (this.kpis.usuariosTotal === 0) {
      notes.push('Todavía no se han registrado usuarios en el sistema.');
    }

    if (!notes.length) {
      notes.push('Todo en orden. Revisión general al día.');
    }

    this.notas = notes;
  }

  /** Mapea 1/2/3 a Admin/Ejecutivo/Ahorrador y hace fallback para strings. */
  private mapRolDisplay(rolRaw: string): string {
    const r = rolRaw.trim();
    switch (r) {
      case '1':
        return 'Admin';
      case '2':
        return 'Ejecutivo';
      case '3':
        return 'Ahorrador';
    }

    const low = r.toLowerCase();
    if (low === 'admin' || low === 'administrador') return 'Admin';
    if (low === 'ejecutivo') return 'Ejecutivo';
    if (low === 'ahorrador') return 'Ahorrador';

    // Capitaliza genérico
    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  /** Recalcula Top Ahorradores aplicando filtro de ciclo y usuarios. */
  private recalcularTopAhorradores(): void {
    const ahorroPorUsuario: Record<string, number> = {};

    for (const a of this.abonosRaw) {
      const status = (a.status || '').toUpperCase();
      if (status !== 'CONCILIADO') continue;

      // Filtro por ciclo
      const cicloId = a.id_ciclo ?? a.ciclo_id ?? a.ciclo ?? a.idCiclo ?? null;
      if (
        this.selectedCicloId !== 'todos' &&
        cicloId !== this.selectedCicloId
      ) {
        continue;
      }

      // Filtro usuarios activos
      if (this.usuarioFiltro === 'activos') {
        const creador =
          a.user_create || a.usuario || a.cliente || a.nombre_usuario || null;

        if (creador) {
          const u = this.usuariosRaw.find((u: any) => {
            const nombre =
              u.nombre ?? u.nombre_completo ?? u.displayName ?? null;
            const usuario = u.usuario ?? u.username ?? null;
            const correo = u.correo ?? u.email ?? null;
            return (
              creador === nombre || creador === usuario || creador === correo
            );
          });

          if (u) {
            const estadoRaw =
              u.estatus ?? u.estado ?? u.status ?? u.activo ?? '';
            const estado = String(estadoRaw).toLowerCase();
            const isInactivo =
              estado === 'inactivo' ||
              estado === 'baja' ||
              estado === 'false' ||
              estado === '0';
            if (isInactivo) continue;
          }
        }
      }

      const nombre = a.user_create || 'Desconocido';
      const monto = Number(a.monto_abono || 0);
      if (!monto) continue;

      ahorroPorUsuario[nombre] = (ahorroPorUsuario[nombre] || 0) + monto;
    }

    this.topAhorradores = Object.entries(ahorroPorUsuario)
      .map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10); // top 10
  }

  /** Actividad reciente, usando usuario_conciliacion y fe_conciliacion. */
  private buildActividadesRecientes(abonosArr: any[]): void {
    const items: ActividadReciente[] = [];

    const sorted = [...abonosArr].sort((a, b) => {
      const da =
        this.parseDate(
          a.fe_conciliacion || a.fe_update || a.fe_create
        )?.getTime() || 0;
      const db =
        this.parseDate(
          b.fe_conciliacion || b.fe_update || b.fe_create
        )?.getTime() || 0;
      return db - da; // más reciente primero
    });

    for (const a of sorted) {
      const status = (a.status || '').toUpperCase();
      if (!status) continue;

      const usuarioConc =
        a.usuario_conciliacion || a.user_update || a.user_create || 'Sistema';

      const fecha = this.parseDate(
        a.fe_conciliacion || a.fe_update || a.fe_create
      );
      if (!fecha) continue;

      const monto = Number(a.monto_abono || 0);
      const ahorrador = a.nombre_ahorrador || a.cliente || a.nombre || '';

      let titulo = '';
      let descripcion = '';

      if (status === 'CONCILIADO') {
        titulo = 'Conciliación de abono';
        descripcion = `El usuario ${usuarioConc} concilió el abono de ${
          ahorrador || 'un ahorrador'
        } por la cantidad de $${monto.toFixed(2)}.`;
      } else if (status === 'RECHAZADO') {
        titulo = 'Rechazo de abono';
        descripcion = `El usuario ${usuarioConc} rechazó el abono de ${
          ahorrador || 'un ahorrador'
        } por $${monto.toFixed(2)}.`;
      } 
      
      // Buscar rol del usuario que concilia
      let rol = 'Ejecutivo';
      const uMatch = this.usuariosRaw.find((u: any) => {
        const nombre = u.nombre ?? u.nombre_completo ?? u.displayName ?? null;
        const usuario = u.usuario ?? u.username ?? null;
        const correo = u.correo ?? u.email ?? null;
        return (
          usuarioConc === nombre ||
          usuarioConc === usuario ||
          usuarioConc === correo
        );
      });

      if (uMatch) {
        rol = this.mapRolDisplay(
          String(uMatch.tipo_usuario ?? uMatch.tipo ?? uMatch.rol ?? '')
        );
      }

      items.push({
        usuario: usuarioConc,
        rol,
        titulo,
        descripcion,
        fecha,
      });

      // Solo las 3 primeras actividades
      if (items.length >= 3) break;
    }

    this.actividadesRecientes = items;
  }

  // === Handlers de UI ===

  onCicloChange(value: string): void {
    this.selectedCicloId = value || 'todos';
    this.recalcularTopAhorradores();
  }

  onUsuarioFiltroChange(tipo: 'activos' | 'todos'): void {
    if (this.usuarioFiltro === tipo) return;
    this.usuarioFiltro = tipo;
    this.recalcularTopAhorradores();
  }

  onBarClick(s: EstadoChartItem): void {
    this.selectedStatusKey = this.selectedStatusKey === s.key ? null : s.key;
  }
}
