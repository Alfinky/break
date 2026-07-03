export interface Employee {
  id: string;
  name: string;
  createdAt: string;
}

export interface BreakSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  machine: string;
  startHour: string;
  endHour: string;
  date: string; // YYYY-MM-DD
  status: 'Scheduled' | 'On Break' | 'Completed';
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'karyawan';
