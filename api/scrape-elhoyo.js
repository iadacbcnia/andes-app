// api/scrape-elhoyo.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2Z9PnT0bz9SI47_BW1BcW1tjqbQjYnC0",
  authDomain: "andes-app-turismo.firebaseapp.com",
  projectId: "andes-app-turismo",
  storageBucket: "andes-app-turismo.appspot.com",
  messagingSenderId: "685878856963",
  appId: "1:685878856963:web:660823dfdac24a0c39ed36"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Paso 1: Obtener la página
    const response = await fetch('https://turismoelhoyo.com.ar/');
    const html = await response.text();

    // Paso 2: Extraer título y primer párrafo (ajustar según la web)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "Novedades de El Hoyo";

    // Buscar un párrafo con más de 20 caracteres
    const bodyMatch = html.match(/<p[^>]*>([^<]{20,})/i);
    const content = bodyMatch ? bodyMatch[1].trim() : "No hay novedades disponibles.";

    // Paso 3: Guardar en Firebase
    await addDoc(collection(db, 'actualizacionesOficiales'), {
      fuente: "El Hoyo",
      urlFuente: "https://turismoelhoyo.com.ar/",
      titulo: title,
      contenido: content,
      fechaExtraccion: serverTimestamp(),
      tipo: "novedadOficial"
    });

    res.status(200).json({ success: true, message: "Scraping completado para El Hoyo" });
  } catch (error) {
    console.error("Error en scraping:", error);
    res.status(500).json({ error: error.message });
  }
}