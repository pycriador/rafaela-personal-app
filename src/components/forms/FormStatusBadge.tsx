import React from 'react';
import { Badge } from '../ui/Badge';
import { FormStatus, FormApplicationStatus, FormResponseStatus } from '../../types';

interface FormStatusBadgeProps {
  status: FormStatus | FormApplicationStatus | FormResponseStatus | string;
  type?: 'form' | 'application' | 'response';
  size?: 'sm' | 'md';
}

export const FormStatusBadge: React.FC<FormStatusBadgeProps> = ({ status, type = 'application', size = 'sm' }) => {
  switch (status) {
    // Form statuses
    case 'active':
      return <Badge variant="success" size={size}>Ativo</Badge>;
    case 'draft':
      return <Badge variant="neutral" size={size}>Rascunho</Badge>;
    case 'inactive':
      return <Badge variant="warning" size={size}>Inativo</Badge>;
    case 'archived':
      return <Badge variant="neutral" size={size}>Arquivado</Badge>;

    // Application statuses
    case 'pending':
      return <Badge variant="warning" size={size}>Pendente</Badge>;
    case 'in_progress':
      return <Badge variant="brand" size={size}>Em Andamento</Badge>;
    case 'completed':
      return <Badge variant="success" size={size}>Respondida</Badge>;
    case 'expired':
      return <Badge variant="danger" size={size}>Expirada</Badge>;
    case 'cancelled':
      return <Badge variant="neutral" size={size}>Cancelada</Badge>;

    // Response statuses
    case 'submitted':
      return <Badge variant="info" size={size}>Enviada</Badge>;
    case 'reviewed':
      return <Badge variant="success" size={size}>Revisada</Badge>;

    default:
      return <Badge variant="neutral" size={size}>{status}</Badge>;
  }
};
