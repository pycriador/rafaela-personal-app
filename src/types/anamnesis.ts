export type FormStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type FormVersionStatus = 'draft' | 'published' | 'archived';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'decimal'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'scale'
  | 'checkbox'
  | 'terms';

export type ConditionOperator = 'equals' | 'notEquals';

export interface FormCondition {
  fieldId: string;
  operator: ConditionOperator;
  value: any;
}

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  versionId: string;
  sectionId: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  options?: FormFieldOption[];
  order: number;
  condition?: FormCondition;
  active: boolean;
}

export interface FormSection {
  id: string;
  versionId: string;
  title: string;
  description?: string;
  order: number;
}

export interface FormVersion {
  id: string;
  formId: string;
  version: number;
  status: FormVersionStatus;
  sections: FormSection[];
  termsVersion: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  status: FormStatus;
  currentVersionId: string;
  createdBy: string;
  trainerId?: string; // ID do personal criador ou null para formulário global da plataforma
  isGlobal?: boolean; // Se é um modelo padrão oficial da plataforma
  createdAt: string;
  updatedAt: string;
}

export type FormApplicationStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface FormApplication {
  id: string;
  formId: string;
  formVersionId: string;
  studentId: string;
  status: FormApplicationStatus;
  assignedBy: string;
  assignedAt: string;
  dueAt?: string | null;
  message?: string;
  notes?: string;
  isMandatory?: boolean;
}

export type FormResponseStatus = 'draft' | 'submitted' | 'reviewed';

export interface FormAnswer {
  id: string;
  responseId: string;
  fieldId: string;
  value: any;
}

export interface ConsentRecord {
  id: string;
  responseId: string;
  studentId: string;
  accepted: boolean;
  acceptedAt: string;
  termsVersion: string;
  formVersion: number;
  statement: string;
}

export interface FormResponse {
  id: string;
  applicationId: string;
  formId: string;
  formVersionId: string;
  studentId: string;
  status: FormResponseStatus;
  answers: FormAnswer[];
  consentRecord?: ConsentRecord;
  startedAt?: string;
  submittedAt?: string;
  submittedBy?: string;
  notes?: string;
}

export interface FormAuditEvent {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: 'form' | 'form_version' | 'form_field' | 'form_application' | 'form_response' | 'consent';
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnamnesisStats {
  activeFormsCount: number;
  pendingApplicationsCount: number;
  submittedResponsesCount: number;
  expiredApplicationsCount: number;
}
