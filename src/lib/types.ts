export type TaskType = "image" | "video" | "edit";

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export interface TaskPayload {
  prompt?: string;
  referenceImageUrl?: string;
  styleId?: string;
  resolution?: string;
  aspectRatio?: string;
  // Arbitrary extras per model/feature
  extras?: Record<string, unknown>;
}

export interface Task {
  id: string;
  cSiteId?: string;
  callbackUrl?: string;
  type: TaskType;
  payload: TaskPayload;
  status: TaskStatus;
  freepikTaskId?: string;
  apiKeyUsed?: string;
  resultUrls?: string[];
  r2Urls?: string[];
  createdAt: string;
  updatedAt: string;
}
