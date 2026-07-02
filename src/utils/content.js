function compareByOrderAndCreatedAt(a, b) {
  const orderA = Number.isFinite(a?.order) ? a.order : 0;
  const orderB = Number.isFinite(b?.order) ? b.order : 0;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  const createdAtA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
  const createdAtB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;

  return createdAtA - createdAtB;
}

export function getProgramAnchor(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sortPrograms(programs) {
  return programs
    .map((program, index) => ({
      ...program,
      _id: program._id || `program-${index}`,
      imageUrl: program.imageUrl || program.image || "",
    }))
    .sort(compareByOrderAndCreatedAt);
}

export function sortTeachers(teachers) {
  return teachers
    .map((teacher, index) => ({
      ...teacher,
      _id: teacher._id || `teacher-${index}`,
      imageUrl: teacher.imageUrl || "",
    }))
    .sort(compareByOrderAndCreatedAt);
}
