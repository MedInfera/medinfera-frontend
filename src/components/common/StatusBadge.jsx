const STATUS_MAP = {
  // Appointment
  confirmed: { cls: 'badge-blue',   label: 'Confirmed'  },
  pending:   { cls: 'badge-amber',  label: 'Pending'    },
  completed: { cls: 'badge-green',  label: 'Completed'  },
  cancelled: { cls: 'badge-red',    label: 'Cancelled'  },
  approved:  { cls: 'badge-blue',   label: 'Approved'   },
  // Beds
  available:   { cls: 'badge-green',  label: 'Available'   },
  occupied:    { cls: 'badge-red',    label: 'Occupied'    },
  cleaning:    { cls: 'badge-amber',  label: 'Cleaning'    },
  maintenance: { cls: 'badge-slate',  label: 'Maintenance' },
  // Doctors
  active:    { cls: 'badge-green',  label: 'Active'     },
  'on-leave':{ cls: 'badge-amber',  label: 'On Leave'   },
  inactive:  { cls: 'badge-slate',  label: 'Inactive'   },
  // Payment
  paid:      { cls: 'badge-green',  label: 'Paid'       },
  unpaid:    { cls: 'badge-red',    label: 'Unpaid'     },
  // Type
  Online:    { cls: 'badge-purple', label: 'Online'     },
  Offline:   { cls: 'badge-slate',  label: 'Offline'    },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { cls: 'badge-slate', label: status };
  return <span className={cfg.cls}>{cfg.label}</span>;
}
