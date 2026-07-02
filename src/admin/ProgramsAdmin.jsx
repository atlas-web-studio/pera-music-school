import { useState, useEffect } from "react";
import api from "../api/api";
import { getAdminApiErrorMessage } from "./adminApiError.js";
import { sortPrograms } from "../utils/content.js";

const emptyProgram = {
  title: "",
  description: "",
  level: "",
  image: "",
  logo: "",
};

export default function ProgramsAdmin() {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingProgram, setEditingProgram] = useState(null);
  const [mode, setMode] = useState(null);
  const [originalTitle, setOriginalTitle] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const res = await api.get("/api/programs");
        setPrograms(sortPrograms(res.data));
      } catch (err) {
        console.error(err);
        setLoadError(
          getAdminApiErrorMessage(err, "Programs could not be loaded.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const openAddForm = () => {
    setActionError("");
    setEditingProgram(emptyProgram);
    setOriginalTitle(null);
    setMode("add");
  };

  const openEditForm = (program) => {
    setActionError("");
    setEditingProgram({
      ...program,
      description: program.description || "",
      level: program.level || "",
      image: program.image || program.imageUrl || "",
      imageFile: null,
    });

    setOriginalTitle(program.title);
    setMode("edit");
  };

  const handleChange = (field, value) => {
    setEditingProgram((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setEditingProgram((prev) => ({
      ...prev,
      image: previewUrl,
      imageFile: file,
    }));
  };

  const handleSave = async () => {
    setActionError("");

    try {
      const formData = new FormData();

      formData.append("title", editingProgram.title);
      formData.append("description", editingProgram.description);
      formData.append("level", editingProgram.level);

      if (editingProgram.imageFile) {
        formData.append("image", editingProgram.imageFile);
      }

      if (mode === "add") {
        const res = await api.post("/api/programs", formData);

        setPrograms((prev) => sortPrograms([...prev, res.data]));
      }

      if (mode === "edit") {
        const programToUpdate = programs.find(
          (p) => p._id === editingProgram._id || p.title === originalTitle
        );

        if (!programToUpdate) {
          throw new Error("Program to update was not found.");
        }

        formData.append("order", programToUpdate.order ?? 0);

        const res = await api.put(
          `/api/programs/${programToUpdate._id}`,
          formData
        );

        setPrograms((prev) =>
          sortPrograms(
            prev.map((p) => (p._id === programToUpdate._id ? res.data : p))
          )
        );
      }

      setEditingProgram(null);
      setOriginalTitle(null);
      setMode(null);
    } catch (err) {
      console.error(err);
      setActionError(
        getAdminApiErrorMessage(err, "Program changes could not be saved.")
      );
    }
  };

  const deleteProgram = async (id) => {
    setActionError("");

    try {
      await api.delete(`/api/programs/${id}`);
      setPrograms((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setActionError(
        getAdminApiErrorMessage(err, "Program could not be deleted.")
      );
    }
  };

  const closeForm = () => {
    setEditingProgram(null);
    setOriginalTitle(null);
    setMode(null);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Content Management</p>
          <h1 className="admin-title">Programs</h1>
          <p className="admin-subtitle">
            Add, edit, and control which programs appear on the homepage.
          </p>
        </div>

        <button
          className="admin-button"
          onClick={openAddForm}
          disabled={Boolean(loadError)}
        >
          + Add Program
        </button>
      </div>

      {loadError ? <div className="admin-system-alert">{loadError}</div> : null}
      {actionError ? <div className="admin-system-alert">{actionError}</div> : null}

      {isLoading ? (
        <div className="admin-empty-state">Loading programs...</div>
      ) : programs.length === 0 ? (
        <div className="admin-empty-state">
          {loadError || "No programs have been added yet."}
        </div>
      ) : (
        <div className="admin-grid">
          {programs.map((program) => (
            <article className="admin-item-card" key={program._id}>
              <div className="admin-item-image">
                {program.image || program.imageUrl ? (
                  <img src={program.image || program.imageUrl} alt={program.title} />
                ) : (
                  <div className="admin-program-placeholder">
                    <span>{program.title}</span>
                  </div>
                )}
              </div>

              <div className="admin-item-body">
                {program.level ? (
                  <p className="admin-program-level">{program.level}</p>
                ) : null}

                <div className="admin-item-top admin-program-top">
                  <h3>{program.title}</h3>
                </div>

                <p>{program.description || program.shortDescription}</p>

                <div className="admin-actions">
                  <button onClick={() => openEditForm(program)}>Edit</button>

                  <button
                    className="danger"
                    onClick={() => deleteProgram(program._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingProgram && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2>{mode === "add" ? "Add Program" : "Edit Program"}</h2>

            <label>Title</label>
            <input
              value={editingProgram.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />

            <label>Short Description</label>
            <textarea
              value={editingProgram.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />

            <label>Level / Category</label>
            <input
              value={editingProgram.level}
              onChange={(e) => handleChange("level", e.target.value)}
              placeholder="Beginner • All Ages"
            />


            <label>Program Image</label>
            <div className="admin-upload-box">
              {editingProgram.image ? (
                <img src={editingProgram.image} alt="Program preview" />
              ) : (
                <p>No image selected</p>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="admin-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
