export const PAGE_STATUS = {
  DEMO: "DEMO",
  LIVE: "LIVE",
  EDITING: "EDITING",
};

export const STATUS_CLASSES = {
  [PAGE_STATUS.DEMO]: "bg-danger-subtle text-danger border border-danger-subtle",
  [PAGE_STATUS.LIVE]: "bg-success-subtle text-success border border-success-subtle",
  [PAGE_STATUS.EDITING]: "bg-warning-subtle text-warning border border-warning-subtle",
};

const STATUS_RULES = [
  { match: (path) => path.startsWith("/customer/dashboard"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/customer/booking-events"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/customer/profile"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/customer"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/employee/agenda"), status: PAGE_STATUS.DEMO },
  { match: (path) => path.startsWith("/employee/requests"), status: PAGE_STATUS.DEMO },
  { match: (path) => path.startsWith("/employee/rooms"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/employee/clients"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/employee"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/admin/audit"), status: PAGE_STATUS.DEMO },
  { match: (path) => path.startsWith("/admin/rates"), status: PAGE_STATUS.DEMO },
  { match: (path) => path.startsWith("/admin/requests"), status: PAGE_STATUS.DEMO },
  { match: (path) => path.startsWith("/admin"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/rooms"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/services"), status: PAGE_STATUS.LIVE },
  { match: (path) => path.startsWith("/contact"), status: PAGE_STATUS.DEMO },
  { match: (path) => path.startsWith("/login"), status: PAGE_STATUS.LIVE },
];

export const resolvePageStatus = (path = "") => {
  const normalized = path.toLowerCase();
  const found = STATUS_RULES.find((rule) => rule.match(normalized));
  return found ? found.status : PAGE_STATUS.DEMO;
};

export const getStatusClasses = (status) => STATUS_CLASSES[status] || STATUS_CLASSES[PAGE_STATUS.DEMO];
