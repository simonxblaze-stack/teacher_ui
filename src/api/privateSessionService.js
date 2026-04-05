/**
 * FULL FIXED VERSION — TEACHER + STUDENT COMPATIBLE
 */

import api from "./apiClient";

/* =========================================================
   CORE SERVICE
========================================================= */
const privateSessionService = {

  /* ===============================
     🔹 STUDENT SIDE (NEW)
  =============================== */

  // ✅ Get all subjects
  async getSubjects() {
    const res = await api.get("/courses/subjects/");
    return res.data || [];
  },

  // ✅ Get teachers by subject
  async getTeachersBySubject(subjectId) {
    if (!subjectId) return [];
    const res = await api.get(`/sessions/subjects/${subjectId}/teachers/`);
    return res.data || [];
  },

  // ✅ Request session (FIXED PAYLOAD)
  async requestSession(data) {
    const payload = {
      subject_id: data.subject_id,
      teacher_id: data.teacher_id,
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
      duration_minutes: data.duration_minutes || 60,
      session_type: data.session_type || "one_on_one",
      group_strength: data.group_strength || 1,
      notes: data.notes || "",
      student_ids: data.student_ids || [],
    };

    const res = await api.post("/sessions/request/", payload);
    return transformSession(res.data);
  },

  /* ===============================
     🔹 STUDENT LISTS
  =============================== */

  async getSessions(tab = "scheduled") {
    const res = await api.get(`/sessions/student/?tab=${tab}`);
    return (res.data || []).map(transformSession);
  },

  async cancelSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/cancel/`, { reason });
    return transformSession(res.data);
  },

  async confirmReschedule(id) {
    const res = await api.post(`/sessions/${id}/confirm-reschedule/`);
    return transformSession(res.data);
  },

  async declineReschedule(id) {
    const res = await api.post(`/sessions/${id}/decline-reschedule/`);
    return transformSession(res.data);
  },

  /* ===============================
     🔹 TEACHER SIDE
  =============================== */

  async getTeacherSessions() {
    const res = await api.get("/sessions/teacher/sessions/");
    return (res.data || []).map(transformSession);
  },

  async getRequests() {
    const res = await api.get("/sessions/teacher/requests/");
    return (res.data || []).map(transformSession);
  },

  async getHistory() {
    const res = await api.get("/sessions/teacher/history/");
    return (res.data || []).map(transformSession);
  },

  async acceptRequest(id, data = {}) {
    const res = await api.post(`/sessions/${id}/accept/`, data);
    return transformSession(res.data);
  },

  async declineRequest(id, reason = "") {
    const res = await api.post(`/sessions/${id}/decline/`, { reason });
    return transformSession(res.data);
  },

  async rescheduleRequest(id, { new_date, new_time, note = "" }) {
    const res = await api.post(`/sessions/${id}/reschedule/`, {
      scheduled_date: new_date,
      scheduled_time: new_time,
      reason: note,
    });
    return transformSession(res.data);
  },

  async startSession(id) {
    const res = await api.post(`/sessions/${id}/start/`);
    return transformSession(res.data);
  },

  async endSession(id) {
    const res = await api.post(`/sessions/${id}/end/`);
    return transformSession(res.data);
  },

  async teacherCancelSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/teacher-cancel/`, { reason });
    return transformSession(res.data);
  },

  /* ===============================
     🔹 SESSION DETAIL
  =============================== */

  async getSessionDetail(id) {
    const res = await api.get(`/sessions/${id}/`);
    return transformSession(res.data);
  },

  /* ===============================
     🔹 LIVEKIT
  =============================== */

  async joinSession(sessionId) {
    const res = await api.post(`/sessions/${sessionId}/join/`);
    return res.data; // { token, livekit_url, role }
  },

  async getLiveKitToken(sessionId) {
    return privateSessionService.joinSession(sessionId);
  },

  /* ===============================
     🔹 AVAILABILITY
  =============================== */

  async getAvailability() {
    try {
      const res = await api.get("/sessions/teacher/availability/");
      return res.data;
    } catch {
      return {};
    }
  },

  async saveAvailability(data) {
    try {
      const res = await api.post("/sessions/teacher/availability/", data);
      return res.data;
    } catch {
      return { success: false };
    }
  },

  /* ===============================
     🔹 CONSTANTS
  =============================== */

  DAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};


/* =========================================================
   🔄 TRANSFORM FUNCTION
========================================================= */
function transformSession(s) {
  if (!s) return s;

  const actualDur = s.actual_duration_minutes;
  const scheduledDur = s.duration_minutes;

  return {
    ...s,

    // unified fields
    id: s.id,
    subject: s.subject,
    teacher: s.teacher_name,
    student: s.student_name,

    date: s.scheduled_date,
    time: s.scheduled_time,

    duration: actualDur || scheduledDur,
    durationLabel: actualDur
      ? `${actualDur} mins (actual)`
      : `${scheduledDur} mins`,

    groupStrength: s.group_strength || 1,

    startedAt: s.started_at,
    endedAt: s.ended_at,

    participants: s.participants || [],
  };
}


/* =========================================================
   EXPORTS
========================================================= */

export const {
  getSubjects,
  getTeachersBySubject,
  requestSession,

  getSessions,
  cancelSession,
  confirmReschedule,
  declineReschedule,

  getTeacherSessions,
  getRequests,
  getHistory,

  acceptRequest,
  declineRequest,
  rescheduleRequest,
  startSession,
  endSession,
  teacherCancelSession,

  getSessionDetail,
  joinSession,
  getLiveKitToken,

  getAvailability,
  saveAvailability,
} = privateSessionService;

export default privateSessionService;