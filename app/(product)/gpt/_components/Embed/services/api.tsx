import axios from "axios";

// const BASE_URL = "https://researchai-embed-be-production.up.railway.app";
const BASE_URL = "http://localhost:8000";

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "use");

  const response = await axios.post(
    `${BASE_URL}/api/v1/files/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const uploadPdfUrl = async (url: string) => {
  const response = await axios.post(
    `${BASE_URL}/api/v1/files/upload_url`,
    null,
    {
      params: { url, model: "use" },
    },
  );
  return response.data;
};

export const embedAllPdfs = async () => {
  const response = await axios.post(`${BASE_URL}/embed_all_pdfs`, null, {
    params: { model: "use" },
  });
  return response.data.message;
};

export const askQuestion = async (question: string) => {
  const response = await axios.post(
    `${BASE_URL}/ask_question`,
    { question },
    { params: { language: "english" } },
  );
  return response.data.answer;
};
