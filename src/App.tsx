import React, { useState, useEffect, useMemo, SVGProps } from 'react';
import { 
  Plus, 
  Clock, 
  Trash2, 
  Download, 
  UserPlus, 
  ChevronRight, 
  X, 
  Check, 
  Calendar, 
  History, 
  FileSpreadsheet, 
  AlertCircle, 
  Info, 
  UserCheck, 
  Cpu, 
  LogOut, 
  RefreshCw, 
  TrendingUp,
  Search,
  CheckCircle,
  Clock3,
  LogIn,
  Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, BreakSchedule, ActiveTab } from './types';
import qcPassedLogo from './assets/images/qc_passed_logo_1783086420940.jpg';

// Default Mock Data matching the design screenshots precisely
const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Andi', createdAt: new Date('2026-07-03T01:00:00Z').toISOString() },
  { id: 'emp-2', name: 'Siti', createdAt: new Date('2026-07-03T01:00:00Z').toISOString() },
  { id: 'emp-3', name: 'Budi', createdAt: new Date('2026-07-03T01:00:00Z').toISOString() },
  { id: 'emp-4', name: 'Dewi', createdAt: new Date('2026-07-03T01:00:00Z').toISOString() },
];

const DEFAULT_SCHEDULES: BreakSchedule[] = [
  { 
    id: 'sch-1', 
    employeeId: 'emp-1', 
    employeeName: 'Andi', 
    machine: '3-9', 
    startHour: '1', 
    endHour: '3', 
    status: 'On Break', 
    date: '2026-07-03',
    createdAt: new Date('2026-07-03T02:00:00Z').toISOString()
  },
  { 
    id: 'sch-2', 
    employeeId: 'emp-2', 
    employeeName: 'Siti', 
    machine: '10-18', 
    startHour: '6', 
    endHour: '7', 
    status: 'Completed', 
    date: '2026-07-03',
    createdAt: new Date('2026-07-03T02:10:00Z').toISOString()
  },
  { 
    id: 'sch-3', 
    employeeId: 'emp-3', 
    employeeName: 'Budi', 
    machine: 'DK', 
    startHour: '10', 
    endHour: '11', 
    status: 'Scheduled', 
    date: '2026-07-03',
    createdAt: new Date('2026-07-03T02:20:00Z').toISOString()
  },
  { 
    id: 'sch-4', 
    employeeId: 'emp-4', 
    employeeName: 'Dewi', 
    machine: 'DB', 
    startHour: '10', 
    endHour: '11.30', 
    status: 'Scheduled', 
    date: '2026-07-03',
    createdAt: new Date('2026-07-03T02:30:00Z').toISOString()
  },
];

const MACHINE_OPTIONS = ['3-9', '10-18', 'DK', 'DB'];
const TIME_OPTIONS = ['1', '3', '6', '7', '10', '11', '11.30'];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('breaksync_employees');
    return saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES;
  });

  const [schedules, setSchedules] = useState<BreakSchedule[]>(() => {
    const saved = localStorage.getItem('breaksync_schedules');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULES;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('breaksync_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('breaksync_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Toast Alerts State
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Dashboard Form State
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formMachine, setFormMachine] = useState('');
  const [formStartHour, setFormStartHour] = useState('');
  const [formEndHour, setFormEndHour] = useState('');
  const [selectedTableBreakHour, setSelectedTableBreakHour] = useState('1-3');

  // Karyawan Tab Form State
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Modal State (Manage Break for specific employee)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState<Employee | null>(null);
  const [modalMachine, setModalMachine] = useState('');
  const [modalTime, setModalTime] = useState(''); // Representing either start time or main slot

  // Export Menu State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // History / Logs Filter Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyMachineFilter, setHistoryMachineFilter] = useState('All');

  // Date State (Current simulation date)
  const [currentDateString] = useState('2026-07-03');

  // Form Validations
  const isDashboardFormValid = formEmployeeId && formMachine && formStartHour && formEndHour;
  const isModalFormValid = modalMachine && modalTime;

  // Add Employee Handler
  const handleAddEmployee = (nameToUse?: string) => {
    const name = nameToUse || newEmployeeName.trim();
    if (!name) {
      showToast('Nama karyawan tidak boleh kosong', 'error');
      return;
    }
    
    // Check duplication
    if (employees.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
      showToast(`Karyawan dengan nama "${name}" sudah terdaftar`, 'error');
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Math.random().toString(36).substring(2, 9)}`,
      name,
      createdAt: new Date().toISOString()
    };

    setEmployees((prev) => [...prev, newEmp]);
    setNewEmployeeName('');
    showToast(`Berhasil mendaftarkan ${name}`, 'success');
  };

  // Dashboard Create Schedule Handler
  const handleCreateSchedule = () => {
    if (!isDashboardFormValid) {
      showToast('Harap isi semua kolom formulir', 'error');
      return;
    }

    const emp = employees.find((e) => e.id === formEmployeeId);
    if (!emp) {
      showToast('Karyawan tidak valid', 'error');
      return;
    }

    // Check overlapping schedule for this employee today
    const hasOverlap = schedules.some(
      (s) => s.employeeId === emp.id && s.date === currentDateString
    );
    if (hasOverlap) {
      showToast(`${emp.name} sudah memiliki jadwal istirahat hari ini`, 'info');
    }

    const newSch: BreakSchedule = {
      id: `sch-${Math.random().toString(36).substring(2, 9)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      machine: formMachine,
      startHour: formStartHour,
      endHour: formEndHour,
      date: currentDateString,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    setSchedules((prev) => [newSch, ...prev]);
    // Reset form
    setFormEmployeeId('');
    setFormMachine('');
    setFormStartHour('');
    setFormEndHour('');

    showToast(`Jadwal istirahat untuk ${emp.name} berhasil disimpan`, 'success');
  };

  // Quick Action Modal Save Handler (from Karyawan list click)
  const handleSaveModalSchedule = () => {
    if (!modalEmployee || !isModalFormValid) {
      showToast('Lengkapi mesin dan waktu istirahat', 'error');
      return;
    }

    // Since the original HTML modal only takes "Waktu Istirahat" as a single button,
    // let's assign a smart logical schedule block:
    // If they choose '1', break is '1' to '3'
    // If they choose '3', break is '3' to '4'
    // If they choose '6', break is '6' to '7'
    // If they choose '7', break is '7' to '8'
    // If they choose '10', break is '10' to '11'
    // If they choose '11', break is '11' to '12'
    // If they choose '11.30', break is '11.30' to '12.30'
    let endT = '';
    if (modalTime === '1') endT = '3';
    else if (modalTime === '3') endT = '4';
    else if (modalTime === '6') endT = '7';
    else if (modalTime === '7') endT = '8';
    else if (modalTime === '10') endT = '11';
    else if (modalTime === '11') endT = '12';
    else if (modalTime === '11.30') endT = '12.30';
    else endT = (parseFloat(modalTime) + 1).toString();

    const newSch: BreakSchedule = {
      id: `sch-${Math.random().toString(36).substring(2, 9)}`,
      employeeId: modalEmployee.id,
      employeeName: modalEmployee.name,
      machine: modalMachine,
      startHour: modalTime,
      endHour: endT,
      date: currentDateString,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    setSchedules((prev) => [newSch, ...prev]);
    setIsModalOpen(false);
    showToast(`Berhasil menyimpan jadwal!\nNama: ${modalEmployee.name}\nMesin: ${modalMachine}\nWaktu: ${modalTime} - ${endT}`, 'success');
    
    // Switch to dashboard so they can see the saved schedule
    setActiveTab('dashboard');
  };

  // Open Quick Actions Modal for Employee
  const openModalForEmployee = (emp: Employee) => {
    setModalEmployee(emp);
    setModalMachine('');
    setModalTime('');
    setIsModalOpen(true);
  };

  // Delete Schedule
  const handleDeleteSchedule = (id: string, name: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    showToast(`Jadwal istirahat ${name} telah dihapus`, 'info');
  };

  // Change Schedule Status Toggle
  const toggleScheduleStatus = (id: string) => {
    setSchedules((prev) => prev.map((s) => {
      if (s.id === id) {
        const nextStatus: BreakSchedule['status'] = 
          s.status === 'Scheduled' ? 'On Break' : 
          s.status === 'On Break' ? 'Completed' : 'Scheduled';
        showToast(`Status ${s.employeeName} diubah ke "${nextStatus}"`, 'info');
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Delete Employee
  const handleDeleteEmployee = (id: string, name: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    // Also clean up their schedules
    setSchedules((prev) => prev.filter((s) => s.employeeId !== id));
    showToast(`Karyawan ${name} dan seluruh jadwalnya berhasil dihapus`, 'info');
  };

  // Export Handlers
  const exportAsCSV = () => {
    const headers = ['Mesin', 'Nama Karyawan', 'Mulai', 'Selesai', 'Status', 'Tanggal'];
    const rows = schedules.map((s) => [
      s.machine,
      s.employeeName,
      s.startHour,
      s.endHour,
      s.status,
      s.date
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BreakSync_Jadwal_${currentDateString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    showToast('Berhasil mengekspor jadwal ke CSV', 'success');
  };

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schedules, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `BreakSync_Jadwal_${currentDateString}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    showToast('Berhasil mengekspor jadwal ke JSON', 'success');
  };

  const exportToJpg = () => {
    // Let's create an off-screen canvas with high resolution
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define table data
    const machines = machinesToRender;
    const hours = hoursToRender;

    // Grid coordinates
    const marginX = 80;
    const marginTop = 170;
    const marginBottom = 100;

    const totalTableWidth = 840;
    const firstColWidth = 180;
    const otherColWidth = hours.length > 0 ? (totalTableWidth - firstColWidth) / hours.length : 0;

    const headerHeight = 65;
    const rowHeight = 70;
    const totalTableHeight = headerHeight + (machines.length * rowHeight);

    // Canvas size setup
    canvas.width = totalTableWidth + (2 * marginX);
    canvas.height = marginTop + totalTableHeight + marginBottom;

    // 1. Draw solid white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Helper for rounded rectangles to support universal browsers
    const drawRoundedRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };

    // 2. Draw Title: "JADWAL ISTIRAHAT" centered, red, underlined
    ctx.fillStyle = '#C0392B'; // Crimson red
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 42px "Times New Roman"';
    
    const titleText = 'JADWAL ISTIRAHAT';
    const titleX = canvas.width / 2;
    const titleY = 85;
    ctx.fillText(titleText, titleX, titleY);

    // Draw red underline matching width of text
    const textWidth = ctx.measureText(titleText).width;
    ctx.beginPath();
    ctx.moveTo(titleX - textWidth / 2, titleY + 22);
    ctx.lineTo(titleX + textWidth / 2, titleY + 22);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 3. Draw Table Container with rounded corners
    const tableX = marginX;
    const tableY = marginTop;
    const borderRadius = 16;

    // Clip to draw header background with top rounded corners
    ctx.save();
    drawRoundedRect(ctx, tableX, tableY, totalTableWidth, totalTableHeight, borderRadius);
    ctx.clip();

    // Draw header background (light gray #F2F2F2)
    ctx.fillStyle = '#F2F2F2';
    ctx.fillRect(tableX, tableY, totalTableWidth, headerHeight);

    // Draw rows background (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tableX, tableY + headerHeight, totalTableWidth, totalTableHeight - headerHeight);

    // Write Header Row Texts
    ctx.fillStyle = '#1F2937'; // Charcoal / dark text
    ctx.font = 'bold 20px "Times New Roman"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // First header: MESIN
    ctx.fillText('MESIN', tableX + firstColWidth / 2, tableY + headerHeight / 2);

    // Hour headers: JAM 1, JAM 3, etc.
    let currentHeaderX = tableX + firstColWidth;
    for (let i = 0; i < hours.length; i++) {
      ctx.fillText(`JAM ${hours[i]}`, currentHeaderX + otherColWidth / 2, tableY + headerHeight / 2);
      currentHeaderX += otherColWidth;
    }

    // Write Row Texts
    ctx.font = '22px "Times New Roman"';
    ctx.fillStyle = '#1F2937';

    for (let r = 0; r < machines.length; r++) {
      const mac = machines[r];
      const rowY = tableY + headerHeight + (r * rowHeight);

      // Col 0: Machine Name
      ctx.textAlign = 'center';
      ctx.fillText(mac, tableX + firstColWidth / 2, rowY + rowHeight / 2);

      // Hour Columns: Employee Name or Dash —
      let currentCellX = tableX + firstColWidth;
      for (let h = 0; h < hours.length; h++) {
        const hr = hours[h];
        
        // Find matching schedules
        const matchingSchedules = schedules.filter((s) => {
          const scheduleInterval = `${s.startHour}-${s.endHour}`;
          return s.machine === mac && (scheduleInterval === hr || s.startHour === hr);
        });

        if (matchingSchedules.length > 0) {
          const names = matchingSchedules.map(s => s.employeeName);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          if (names.length > 1) {
            ctx.font = '20px "Times New Roman"';
          } else {
            ctx.font = '22px "Times New Roman"';
          }

          const lineSpacing = names.length > 2 ? 20 : 24;
          const totalHeight = (names.length - 1) * lineSpacing;
          const startY = (rowY + rowHeight / 2) - (totalHeight / 2);

          for (let idx = 0; idx < names.length; idx++) {
            ctx.fillText(names[idx], currentCellX + otherColWidth / 2, startY + (idx * lineSpacing));
          }
          ctx.font = '22px "Times New Roman"'; // Reset font
        } else {
          // Draw standard em-dash
          ctx.fillStyle = '#9CA3AF'; // Muted grey for dashes
          ctx.fillText('—', currentCellX + otherColWidth / 2, rowY + rowHeight / 2);
          ctx.fillStyle = '#1F2937'; // Reset color
        }
        currentCellX += otherColWidth;
      }
    }

    ctx.restore(); // Stop clipping

    // 4. Draw Table Grid Lines
    ctx.strokeStyle = '#D1D5DB'; // Light grey borders
    ctx.lineWidth = 1;

    // Draw Outer border
    ctx.save();
    drawRoundedRect(ctx, tableX, tableY, totalTableWidth, totalTableHeight, borderRadius);
    ctx.stroke();
    ctx.restore();

    // Draw horizontal dividers
    // Header divider line
    ctx.beginPath();
    ctx.moveTo(tableX, tableY + headerHeight);
    ctx.lineTo(tableX + totalTableWidth, tableY + headerHeight);
    ctx.stroke();

    // Body row dividers
    for (let r = 1; r < machines.length; r++) {
      const dividerY = tableY + headerHeight + (r * rowHeight);
      ctx.beginPath();
      ctx.moveTo(tableX, dividerY);
      ctx.lineTo(tableX + totalTableWidth, dividerY);
      ctx.stroke();
    }

    // Draw vertical dividers
    let verticalX = tableX + firstColWidth;
    for (let h = 0; h < hours.length; h++) {
      ctx.beginPath();
      ctx.moveTo(verticalX, tableY);
      ctx.lineTo(verticalX, tableY + totalTableHeight);
      ctx.stroke();
      verticalX += otherColWidth;
    }

    // 5. Draw Footer: Creator credit "Dibuat oleh M. Alfin Pathul Mukarrobin © 2026"
    ctx.fillStyle = '#9CA3AF'; // Light secondary grey
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 16px "Times New Roman"';
    
    const footerText = 'Dibuat oleh M. Alfin Pathul Mukarrobin © 2026';
    const footerY = canvas.height - 45;
    ctx.fillText(footerText, canvas.width / 2, footerY);

    // 6. Download as JPG
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `Jadwal_Istirahat_${selectedTableBreakHour}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportMenu(false);
      showToast('Gambar Jadwal Istirahat (Times New Roman) berhasil diunduh!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Gagal mengekspor ke JPG, silakan coba lagi', 'error');
    }
  };

  // Filter Employees based on search
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => 
      e.name.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employees, employeeSearch]);

  // Live and past filtered history schedules
  const filteredHistorySchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchText = s.employeeName.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
                        s.machine.toLowerCase().includes(historySearchTerm.toLowerCase());
      const matchMachine = historyMachineFilter === 'All' || s.machine === historyMachineFilter;
      return matchText && matchMachine;
    });
  }, [schedules, historySearchTerm, historyMachineFilter]);

  // Dynamic machines and hours calculations for the simplified matrix view requested by user
  const machinesToRender = useMemo(() => {
    const baseMachines = ['3-9', '10-18', 'DK', 'DB'];
    const customMachinesInSchedules = Array.from(new Set<string>(schedules.map(s => s.machine)))
      .filter(m => m && !baseMachines.includes(m));
    return [...baseMachines, ...customMachinesInSchedules];
  }, [schedules]);

  const hoursToRender = useMemo(() => {
    if (selectedTableBreakHour === '1-3') return ['1', '3'];
    if (selectedTableBreakHour === '6-7') return ['6', '7'];
    if (selectedTableBreakHour === '10-11') return ['10', '11'];
    if (selectedTableBreakHour === '10-11.30') return ['10', '11.30'];
    
    // For 'Semua' or other, show all the base hours
    const baseHours = ['1', '3', '6', '7', '10', '11', '11.30'];
    // Show extra hours if they are scheduled
    const extraHoursInSchedules = Array.from(new Set<string>(schedules.map(s => s.startHour)))
      .filter(h => h && !baseHours.includes(h))
      .sort((a, b) => parseFloat(a) - parseFloat(b));
    return [...baseHours, ...extraHoursInSchedules];
  }, [selectedTableBreakHour, schedules]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col relative selection:bg-primary-container selection:text-white">
      
      {/* Toast Notifications container */}
      <div className="fixed top-4 right-4 z-[99] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className={`p-4 rounded-xl shadow-lg border pointer-events-auto flex items-start gap-3 text-sm font-medium ${
                toast.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              <span className="flex-grow whitespace-pre-line leading-relaxed">{toast.message}</span>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="hover:bg-black/5 rounded p-0.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TopNavBar (Shared Component) */}
      <header className="w-full sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-50 transition-colors">
        <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-10">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <img
                src={qcPassedLogo}
                alt="QC Passed Logo"
                className="w-10 h-10 object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-bold tracking-tight text-primary font-sans">Dinar Mc</span>
            </div>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex gap-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-1 text-sm font-semibold tracking-wide border-b-2 transition-all duration-150 relative cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'text-primary border-primary font-bold'
                    : 'text-secondary border-transparent hover:text-primary'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('karyawan')}
                className={`py-1 text-sm font-semibold tracking-wide border-b-2 transition-all duration-150 relative cursor-pointer ${
                  activeTab === 'karyawan'
                    ? 'text-primary border-primary font-bold'
                    : 'text-secondary border-transparent hover:text-primary'
                }`}
              >
                Karyawan
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Export Actions (Export Button) */}
            <div className="relative">
              <button 
                id="exportButton"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 duration-150 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor</span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-outline-variant bg-surface-container-low">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Opsi Ekspor</span>
                      </div>
                      <button 
                        onClick={exportToJpg}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold bg-primary/5 hover:bg-primary/15 text-primary flex items-center gap-2 transition-colors cursor-pointer border-b border-outline-variant"
                      >
                        <Image className="w-4 h-4 text-primary" />
                        <span>Ekspor ke JPG</span>
                      </button>
                      <button 
                        onClick={exportAsCSV}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-surface-container text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Ekspor ke CSV</span>
                      </button>
                      <button 
                        onClick={exportAsJSON}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-surface-container text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <CodeIcon className="w-4 h-4 text-blue-600" />
                        <span>Ekspor ke JSON</span>
                      </button>
                      <button 
                        onClick={() => {
                          const summaryText = schedules.map(s => `[${s.machine}] ${s.employeeName}: ${s.startHour} - ${s.endHour} (${s.status})`).join('\n');
                          navigator.clipboard.writeText(summaryText);
                          showToast('Jadwal berhasil disalin ke clipboard', 'success');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-surface-container text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-amber-500" />
                        <span>Salin Teks Ringkas</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            {/* Quick Mobile Indicator */}
            <div className="md:hidden flex gap-2">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`p-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-secondary'}`}
                title="Dashboard"
              >
                <LayoutIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTab('karyawan')} 
                className={`p-2 rounded-lg transition-all ${activeTab === 'karyawan' ? 'bg-primary/10 text-primary' : 'text-secondary'}`}
                title="Karyawan"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-10 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Welcoming Text exactly from mockup */}
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">Dinar Mc Dashboard</h1>
                <p className="text-base text-secondary font-medium">
                  Kelola waktu istirahat tim Anda dengan presisi dan efisiensi tinggi.
                </p>
              </div>

              {/* Two-Column Layout from Image 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Card: "Atur Jadwal Istirahat" */}
                <div id="createScheduleCard" className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-6 md:p-8 rounded-2xl shadow-md space-y-6">
                  <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-on-surface">Atur Jadwal Istirahat</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Nama Karyawan Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                        Nama Karyawan
                      </label>
                      <select
                        value={formEmployeeId}
                        onChange={(e) => setFormEmployeeId(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-on-surface"
                      >
                        <option value="">Masukkan nama...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                      {employees.length === 0 && (
                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Belum ada karyawan terdaftar. Daftarkan di tab Karyawan.</span>
                        </p>
                      )}
                    </div>

                    {/* Mesin & Jam Row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Pilih Mesin dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                          Pilih Mesin
                        </label>
                        <select
                          value={formMachine}
                          onChange={(e) => setFormMachine(e.target.value)}
                          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-on-surface"
                        >
                          <option value="">Pilih...</option>
                          {MACHINE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                          <option value="Custom">Kustom...</option>
                        </select>
                      </div>

                      {/* Jam dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                          Jam (Mulai)
                        </label>
                        <select
                          value={formStartHour}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormStartHour(val);
                            // Auto fill endHour if standard mapping is known to help the user
                            if (val === '1') setFormEndHour('3');
                            else if (val === '6') setFormEndHour('7');
                            else if (val === '10') {
                              if (formEndHour !== '11.30') setFormEndHour('11');
                            }
                            else if (val === '11') setFormEndHour('12');
                            else if (val === '11.30') setFormEndHour('12.30');
                            else if (val === '3') setFormEndHour('4');
                            else if (val === '7') setFormEndHour('8');
                          }}
                          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-on-surface"
                        >
                          <option value="">Pilih Jam...</option>
                          {TIME_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Custom Machine Field if "Custom" selected */}
                    {formMachine === 'Custom' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5 pt-2"
                      >
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                          Nama Mesin Kustom
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: MC-22, LINE-B..."
                          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-on-surface"
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              setFormMachine(e.target.value.trim());
                            }
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleCreateSchedule}
                    disabled={!isDashboardFormValid}
                    className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:bg-outline-variant/40 disabled:text-secondary/60 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Jadwal</span>
                  </button>
                </div>

                {/* Right Card: "Daftar Jadwal Hari Ini" */}
                <div id="todayScheduleCard" className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-md overflow-hidden flex flex-col h-full">
                  
                  {/* Card Header */}
                  <div className="px-6 py-5 border-b border-outline-variant bg-surface-container-low/40 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-on-surface">Daftar Jadwal Hari Ini</h2>
                          <p className="text-xs text-secondary mt-0.5">Tampilan Matriks Jadwal</p>
                        </div>
                      </div>
                      {/* Badge Count */}
                      <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full animate-fade-in">
                        {schedules.length} Terdaftar
                      </span>
                    </div>

                    {/* Jam Istirahat Selector (Moved to Today's Schedule List Card) */}
                    <div className="flex flex-col gap-3.5 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Pilihan Jam Istirahat:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['1-3', '6-7', '10-11', '10-11.30', 'Semua'].map((interval) => (
                            <button
                              key={interval}
                              onClick={() => {
                                setSelectedTableBreakHour(interval);
                                showToast(`Menampilkan jadwal untuk istirahat ${interval === 'Semua' ? 'semua jam' : `jam ${interval}`}`, 'info');
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                selectedTableBreakHour === interval
                                  ? 'bg-primary text-white shadow-sm scale-102'
                                  : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                              }`}
                            >
                              {interval === 'Semua' ? 'Semua Jam' : `Jam ${interval}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Prominent Export Button */}
                      <div className="border-t border-dashed border-outline-variant pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <span className="text-[11px] font-medium text-secondary italic">
                          * Gambar hasil ekspor menggunakan font klasik Times New Roman
                        </span>
                        <button
                          onClick={exportToJpg}
                          className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <Image className="w-3.5 h-3.5" />
                          <span>Unduh Gambar Jadwal (JPG)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Schedules Table in Matrix Layout */}
                  <div className="overflow-x-auto custom-scrollbar flex-grow min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/40 border-b border-outline-variant">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">
                            MESIN
                          </th>
                          {hoursToRender.map((hr) => (
                            <th key={hr} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">
                              JAM {hr}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {machinesToRender.map((mac, idx) => (
                          <tr 
                            key={mac} 
                            className={`${idx % 2 === 1 ? 'bg-surface-container-low/20' : 'bg-surface-container-lowest'} hover:bg-surface-container/30 transition-colors`}
                          >
                            {/* Machine Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded bg-surface-container-highest text-primary font-bold text-xs border border-outline-variant/30 w-14">
                                {mac}
                              </span>
                            </td>

                            {/* Hour Columns */}
                            {hoursToRender.map((hr) => {
                              const matchingSchedules = schedules.filter((s) => {
                                const scheduleInterval = `${s.startHour}-${s.endHour}`;
                                return s.machine === mac && (scheduleInterval === hr || s.startHour === hr);
                              });

                              return (
                                <td key={hr} className="px-6 py-4 text-sm font-medium text-on-surface">
                                  {matchingSchedules.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                      {matchingSchedules.map((sch) => (
                                        <div 
                                          key={sch.id}
                                          className="group relative flex items-center justify-between gap-2 bg-surface-container-lowest/80 p-2 rounded-xl border border-outline-variant/50 shadow-sm hover:border-primary/50 transition-all duration-150"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span 
                                              onClick={() => toggleScheduleStatus(sch.id)}
                                              title="Klik untuk ubah status"
                                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 cursor-pointer ${
                                                sch.status === 'On Break' 
                                                  ? 'bg-amber-500 animate-pulse'
                                                  : sch.status === 'Completed'
                                                  ? 'bg-emerald-500'
                                                  : 'bg-primary'
                                              }`}
                                            />
                                            <span className="text-sm font-semibold text-on-surface">
                                              {sch.employeeName}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Change status shortcut */}
                                            <button
                                              onClick={() => toggleScheduleStatus(sch.id)}
                                              className="p-1 hover:bg-surface-container rounded text-secondary hover:text-primary transition-colors cursor-pointer"
                                              title="Ubah status"
                                            >
                                              <RefreshCw className="w-3 h-3" />
                                            </button>
                                            
                                            {/* Delete shortcut */}
                                            <button
                                              onClick={() => handleDeleteSchedule(sch.id, sch.employeeName)}
                                              className="p-1 hover:bg-rose-50 rounded text-secondary hover:text-rose-600 transition-colors cursor-pointer"
                                              title="Hapus"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        // Pre-fill create schedule form
                                        setFormMachine(mac);
                                        if (hr.includes('-')) {
                                          const [start, end] = hr.split('-');
                                          setFormStartHour(start);
                                          setFormEndHour(end);
                                        } else {
                                          setFormStartHour(hr);
                                          let endT = '';
                                          if (hr === '1') endT = '3';
                                          else if (hr === '3') endT = '4';
                                          else if (hr === '6') endT = '7';
                                          else if (hr === '7') endT = '8';
                                          else if (hr === '10') endT = '11';
                                          else if (hr === '11') endT = '12';
                                          else if (hr === '11.30') endT = '12.30';
                                          else endT = (parseFloat(hr) + 1).toString();
                                          setFormEndHour(endT);
                                        }
                                        showToast(`Formulir disiapkan untuk Mesin ${mac} di Jam ${hr}`, 'info');
                                        // Scroll to form
                                        document.getElementById('createScheduleCard')?.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className="text-xs text-secondary/40 hover:text-primary font-medium flex items-center gap-1 cursor-pointer hover:underline py-1.5 transition-all"
                                    >
                                      <span>+ Jadwalkan</span>
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card Footer: "Lihat Semua Riwayat" trigger */}
                  <div className="border-t border-outline-variant p-4 bg-surface-container-low/20 text-center">
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-bold text-xs tracking-wide hover:underline cursor-pointer"
                    >
                      <History className="w-4 h-4" />
                      <span>Lihat Semua Riwayat / Log Jadwal</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="karyawan-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* Add Employee Hero Heading exactly matching image 2 */}
              <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
                <h1 className="text-2xl md:text-3.5xl font-bold tracking-tight text-on-surface">
                  Tambah Karyawan Baru
                </h1>
                <p className="text-base text-secondary font-medium">
                  Masukkan nama karyawan baru untuk didaftarkan ke dalam sistem.
                </p>
              </div>

              {/* Form card matching image 2 visual */}
              <div className="w-full max-w-md mx-auto bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-lg space-y-6">
                <div className="space-y-2">
                  <label htmlFor="newEmployeeName" className="text-xs font-bold text-secondary uppercase tracking-wider block">
                    Nama Karyawan
                  </label>
                  <input
                    type="text"
                    id="newEmployeeName"
                    placeholder="Masukkan nama lengkap..."
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEmployee();
                    }}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-on-surface"
                  />
                </div>
                
                <button
                  onClick={() => handleAddEmployee()}
                  className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Tambah Karyawan</span>
                </button>
              </div>

              {/* Employees List Container matching image 2 */}
              <div className="w-full max-w-md mx-auto space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-base md:text-lg font-bold text-on-surface">
                    Daftar Karyawan Terdaftar
                  </h2>
                  <span className="text-xs text-secondary font-bold">
                    {employees.length} Karyawan
                  </span>
                </div>

                {/* Search Bar for Employee */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-secondary">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama karyawan..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary outline-none text-on-surface"
                  />
                  {employeeSearch && (
                    <button 
                      onClick={() => setEmployeeSearch('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-secondary hover:text-on-surface"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-md divide-y divide-outline-variant" id="employeeList">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <div 
                        key={emp.id} 
                        className="w-full flex items-center justify-between p-4 hover:bg-surface-container/30 transition-colors group"
                      >
                        {/* Left Side: Name and registration detail */}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-on-surface">{emp.name}</span>
                          <span className="text-[10px] text-secondary font-semibold font-mono uppercase mt-0.5">
                            ID: {emp.id}
                          </span>
                        </div>
                        
                        {/* Right Side Actions: Quick Schedule Trigger & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModalForEmployee(emp)}
                            className="bg-primary/10 hover:bg-primary hover:text-white text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Atur jadwal istirahat"
                          >
                            <span>Atur Istirahat</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-1.5 text-secondary hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-40 group-hover:opacity-100 cursor-pointer"
                            title="Hapus karyawan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-secondary">
                      <p className="text-sm font-bold">Karyawan tidak ditemukan</p>
                      <p className="text-xs mt-1">Coba gunakan kata kunci pencarian lainnya atau tambah baru di atas.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Quick Action Modal Backdrop - Pixel-perfect match to HTML / Image 2 modal trigger workflow */}
      <AnimatePresence>
        {isModalOpen && modalEmployee && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18 }}
              className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant"
            >
              {/* Modal Header */}
              <div className="bg-primary px-6 md:px-8 py-5 text-white flex justify-between items-center relative">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block">
                    Atur Penempatan &amp; Istirahat
                  </span>
                  <h2 className="text-lg md:text-xl font-bold mt-0.5">
                    {modalEmployee.name}
                  </h2>
                </div>
                <button 
                  className="p-1.5 hover:bg-white/15 rounded-full transition-colors cursor-pointer text-white" 
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Machine Selection Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                    PILIH MESIN
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {MACHINE_OPTIONS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setModalMachine(m)}
                        className={`py-2.5 border rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 text-center ${
                          modalMachine === m
                            ? 'bg-primary border-primary text-white shadow-md'
                            : 'border-outline-variant hover:border-primary hover:text-primary text-on-surface'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Break Time Selection Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                    WAKTU ISTIRAHAT (JAM MULAI)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setModalTime(t)}
                        className={`py-2.5 border rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 text-center ${
                          modalTime === t
                            ? 'bg-primary border-primary text-white shadow-md'
                            : 'border-outline-variant hover:border-primary hover:text-primary text-on-surface'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed pt-1">
                    *Jadwal selesai akan diatur secara otomatis ke +1 jam (+1.5 jam untuk slot 10 dan 11.30).
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2">
                <button
                  disabled={!isModalFormValid}
                  onClick={handleSaveModalSchedule}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-container disabled:bg-outline-variant/40 disabled:text-secondary/60 disabled:cursor-not-allowed transition-all duration-150 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History & Complete Log Logs Drawer Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-on-surface">Riwayat &amp; Log Lengkap Waktu Istirahat</h2>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 text-secondary hover:text-on-surface rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Area */}
              <div className="p-4 bg-surface-container-low/40 border-b border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari karyawan atau mesin..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary text-on-surface"
                  />
                </div>
                <div>
                  <select
                    value={historyMachineFilter}
                    onChange={(e) => setHistoryMachineFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary text-on-surface font-semibold"
                  >
                    <option value="All">Semua Mesin</option>
                    {MACHINE_OPTIONS.map(m => (
                      <option key={m} value={m}>Mesin {m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Body (Scrollable List) */}
              <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                {filteredHistorySchedules.length > 0 ? (
                  <div className="space-y-3">
                    {filteredHistorySchedules.map((sch) => (
                      <div 
                        key={sch.id}
                        className="p-4 border border-outline-variant rounded-xl bg-surface-container-low/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {sch.employeeName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-on-surface">{sch.employeeName}</span>
                            <div className="text-xs text-secondary mt-0.5 flex items-center gap-1.5 font-medium">
                              <span>Mesin {sch.machine}</span>
                              <span className="text-[10px] opacity-45">•</span>
                              <span>{sch.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end">
                          <div className="flex items-center gap-1.5 text-secondary font-semibold text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Mulai: {sch.startHour}</span>
                            <span>→</span>
                            <span>Selesai: {sch.endHour}</span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            sch.status === 'On Break' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : sch.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {sch.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-secondary">
                    <p className="text-sm font-bold">Tidak ada riwayat jadwal ditemukan</p>
                    <p className="text-xs mt-1">Gunakan saringan pencarian lainnya atau tambahkan jadwal baru.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-outline-variant bg-surface-container-low/40 flex justify-between items-center">
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus seluruh log riwayat jadwal?')) {
                      setSchedules([]);
                      showToast('Seluruh log riwayat telah dihapus', 'info');
                    }
                  }}
                  className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Hapus Semua Riwayat
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-xs rounded-lg text-on-surface transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Footer (Shared Component) */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-secondary">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} BreakSync. Semua hak dilindungi undang-undang.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Syarat Ketentuan</a>
            <span className="opacity-40">|</span>
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <span className="opacity-40">|</span>
            <a href="#" className="hover:text-primary transition-colors">Hubungi Kami</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Custom icons to avoid importing non-existent ones or importing too many
function CodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function LayoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
