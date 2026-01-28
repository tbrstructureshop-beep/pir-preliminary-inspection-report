
export interface GeneralData {
  woNo: string;
  partDesc: string;
  pn: string;
  sn: string;
  acReg: string;
  customer: string;
}

export interface Finding {
  finding: string;
  description: string;
  action: string;
  image: string;
}

export interface Material {
  id?: string;
  partNo: string;
  description: string;
  qty: string | number;
  uom: string;
  availability: string;
  pr: string;
  po: string;
  note: string;
  dateChange: string;
}

export interface DashboardData {
  generalData: GeneralData;
  findings: Finding[];
  materialsByFinding: Record<string, Material[]>;
}
