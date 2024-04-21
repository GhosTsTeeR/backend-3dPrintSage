const UserModel = require('../../models/app_3dprintsage/user');

exports.getDataUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!uid) {
      return res.status(400).json({ error: 'Uid es un dato requerido' });
    }

    const userModel = new UserModel();
    const userData = await userModel.getUserById(uid);

    if (userData) {
      return res.status(200).json({ message: 'Inicio de sesión exitoso', data: userData });
    } else {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.modifyDataUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    const userData = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'Uid es un dato requerido' });
    }

    const userModel = new UserModel();
    const updatedUser = await userModel.modifyUser(uid, userData);

    if (updatedUser) {
      return res.status(200).json({ message: 'Se almacenó correctamente', data: updatedUser });
    } else {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al modificar los datos del usuario:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};