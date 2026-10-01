import { handleProjectAssigned } from './project-assigned.handler.js';
import { handleEvidenceStepUploaded } from './evidence-step-uploaded.handler.js';
import { handleEvidenceRejected } from './evidence-rejected.handler.js';
import { handleStageReviewRequested, handleSdiVerificationRequested, handleProjectGolive } from './project-workflow.handler.js';

export async function dispatchMappedWebhook(incomingWebhook, mapping) {
  if (mapping.internalType === 'PROJECT_ASSIGNED') return handleProjectAssigned(incomingWebhook);
  if (mapping.internalType === 'EVIDENCE_STEP_UPLOADED') return handleEvidenceStepUploaded(incomingWebhook);
  if (mapping.internalType === 'EVIDENCE_REJECTED') return handleEvidenceRejected(incomingWebhook);
  if (mapping.internalType === 'STAGE_REVIEW_REQUESTED') return handleStageReviewRequested(incomingWebhook);
  if (mapping.internalType === 'SDI_VERIFICATION_REQUESTED') return handleSdiVerificationRequested(incomingWebhook);
  if (mapping.internalType === 'PROJECT_GOLIVE') return handleProjectGolive(incomingWebhook);
  throw new Error(`Handler tidak tersedia untuk ${mapping.internalType}`);
}
