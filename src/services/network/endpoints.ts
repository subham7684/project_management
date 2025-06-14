export const ENDPOINTS = {
  LOGIN: "/users/token",
  REGISTER: "/users/register",
  PUBLIC_USERS: "/public_users",
  TICKETS: "/tickets",
  PROJECTS: "/projects",
  SPRINTS: "/sprints",
  EPICS: "/epics",
  COMMENTS: "/comments",
  ATTACHMENTS: "/attachments",
  BOARD: "/board",
  LIVE_WATCHERS: "/live-watchers",
  PROJECT_SEARCH: "/project-search",
  REPORT: "/reports",
  SEARCH: "/search",
  SPRINT_SEARCH: "/sprint-search",
  TICKET_SEARCH: "/ticket-search",
  
  TICKET_ASSIGN: "/tickets/{ticketId}/assign",
  TICKET_BULK_ASSIGN: "/tickets/bulk-assign",
  TICKET_HISTORY: "/tickets/{ticketId}/history",
  EPIC_TICKETS: "/epics/{epicId}/tickets",
  SPRINT_TICKETS: "/sprints/{sprintId}/tickets",
  PROJECT_FULL_DETAILS: "/projects/{projectId}/full-details",

  NLP_QUERY: "/nlp_query",
  VISUALIZATION: "/visualization-type"
};