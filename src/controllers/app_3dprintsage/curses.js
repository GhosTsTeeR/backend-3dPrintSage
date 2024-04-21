const CursesModel = require("../../models/app_3dprintsage/curses");

exports.addCurseToBD = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { name, data } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ error: "El nombre del curso es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.addDataCurse(uid, name, data);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al agregar el curso:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.getDataCurses = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res
        .status(400)
        .json({ error: "id del curso es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.getDataCurse(id);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Curso encontrado con éxito", data: result.data });
    } else if (result.status === 404) {
      return res.status(404).json({ error: "Curso no encontrado" });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.getDataCursesAll = async (req, res) => {
  try {
    const cursesModel = new CursesModel();
    const result = await cursesModel.getAllCurses();

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Cursos encontrados con éxito", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
exports.getDataCursesUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId;

    if (!id) {
      return res
        .status(400)
        .json({ error: "id del curso es un dato requerido" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ error: "id del usuario es un dato requerido" });
    }
    const cursesModel = new CursesModel();
    const result = await cursesModel.getDataCurseUser(id, userId);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Curso encontrado con éxito", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al obtener el curso del usuario:", error);
    return res.status(500).json({});
  }
};

exports.addDataCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, name } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.addDataCurseUser(id, uid, name);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al agregar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.modifyDataCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, position, estado } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.modifyDataCurseUser(
      id,
      uid,
      position,
      estado
    );

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else if (result.status === 404) {
      return res.status(404).json({ error: "Curso no encontrado" });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al modificar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.getCurseInfoUser = async (req, res) => {
  try {
    const uid = req.params.uid;

    if (!uid) {
      return res
        .status(400)
        .json({ error: "id del curso es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.getCurseInfoUser(uid);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Curso encontrado con éxito", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error(
      "Error al obtener la información del curso del usuario:",
      error
    );
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.addFinalizateCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, stateCurse } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.addFinalizateCurseUser(
      id,
      uid,
      stateCurse
    );

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else if (result.status === 404) {
      return res.status(404).json({ error: "Curso no encontrado" });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al finalizar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
exports.getDataCursesUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId;

    if (!id) {
      return res
        .status(400)
        .json({ error: "id del curso es un dato requerido" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ error: "id del usuario es un dato requerido" });
    }
    const cursesModel = new CursesModel();
    const result = await cursesModel.getDataCurseUser(id, userId);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Curso encontrado con éxito", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al obtener el curso del usuario:", error);
    return res.status(500).json({});
  }
};

exports.addDataCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, name } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.addDataCurseUser(id, uid, name);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al agregar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.modifyDataCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, position, estado } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.modifyDataCurseUser(
      id,
      uid,
      position,
      estado
    );

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else if (result.status === 404) {
      return res.status(404).json({ error: "Curso no encontrado" });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al modificar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.getCurseInfoUser = async (req, res) => {
  try {
    const uid = req.params.uid;

    if (!uid) {
      return res
        .status(400)
        .json({ error: "id del curso es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.getCurseInfoUser(uid);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Curso encontrado con éxito", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error(
      "Error al obtener la información del curso del usuario:",
      error
    );
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.addFinalizateCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, stateCurse } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.addFinalizateCurseUser(
      id,
      uid,
      stateCurse
    );

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else if (result.status === 404) {
      return res.status(404).json({ error: "Curso no encontrado" });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al finalizar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
// ...

exports.getDataCursesUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId;

    if (!id) {
      return res
        .status(400)
        .json({ error: "id del curso es un dato requerido" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ error: "id del usuario es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.getDataCurseUser(id, userId);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Curso encontrado con éxito", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al obtener el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.addDataCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, name } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.addDataCurseUser(id, uid, name);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al agregar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.modifyDataCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, position, estado } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.modifyDataCurseUser(
      id,
      uid,
      position,
      estado
    );

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else if (result.status === 404) {
      return res.status(404).json({ error: "Curso no encontrado" });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al modificar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.getCurseInfoUser = async (req, res) => {
  try {
    const uid = req.params.uid;

    if (!uid) {
      return res
        .status(400)
        .json({ error: "id del curso es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.getCurseInfoUser(uid);

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Curso encontrado con éxito", data: result.data });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error(
      "Error al obtener la información del curso del usuario:",
      error
    );
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.addFinalizateCurseUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { id, stateCurse } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Uid es un dato requerido" });
    }

    const cursesModel = new CursesModel();
    const result = await cursesModel.addFinalizateCurseUser(
      id,
      uid,
      stateCurse
    );

    if (result.status === 200) {
      return res
        .status(200)
        .json({ message: "Se almacenó correctamente", data: result.data });
    } else if (result.status === 404) {
      return res.status(404).json({ error: "Curso no encontrado" });
    } else {
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } catch (error) {
    console.error("Error al finalizar el curso del usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
