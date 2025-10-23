import { useQuery } from '@tanstack/react-query';
import { EmailTemplatesApiService, EmailTemplate } from '../services/emailTemplatesApiService';

export const useRecruitmentTemplates = () => {
  return useQuery<EmailTemplate[]>({
    queryKey: ['email-templates', 'recruitment'],
    queryFn: () => EmailTemplatesApiService.getRecruitmentTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
