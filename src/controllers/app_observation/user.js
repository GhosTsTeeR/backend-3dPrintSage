const UserModel = require('../../models/app_observation/user');

exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    console.log(userData.userData.uid +"sjkasja");

    const userModel = new UserModel();
    
    const existingUser = await userModel.getUserById(userData.userData.uid);

    if (existingUser) {
      return res.status(200).json({ message: 'Bienvenid@ de vuelta', userId: existingUser.uid });
    } else {
      const newUser = await userModel.createUser(userData);
      return res.status(201).json({ message: 'Es un placer tenerlo con nosotros', userId: newUser.uid });
    }
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return res.status(500).json({ error: 'Error al crear el usuario' });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userModel = new UserModel();
    const user = await userModel.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};
