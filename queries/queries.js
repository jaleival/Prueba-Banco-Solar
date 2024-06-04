import pool from "../config/db.js";

const getDate = async () => {
  try {
    const query = "SELECT NOW()";
    const response = await pool.query(query);
    return response.rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const addUserQuery = async (datos) => {
  try {
    const query = {
      text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *",
      values: datos,
    };
    const response = await pool.query(query);
    return response.rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUserQuery = async () => {
  try {
    const query = {
      text: "SELECT * FROM usuarios",
    };
    const response = await pool.query(query);
    return response.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const editUserQuery = async (datos) => {
  try {
    const query = {
      text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3",
      values: datos,
    };
    const response = await pool.query(query);
    if (response.rowCount === 0) {
      throw new Error("Usuario no encontrado");
    } else {
      response.rows[0];
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteUserQuery = async (id) => {
  try {
    const checkTransferenciasQuery = {
      text: "SELECT COUNT(*) FROM transferencias WHERE emisor = $1 OR receptor = $1",
      values: [id],
    };
    const checkTransferencias = await pool.query(checkTransferenciasQuery);
    const transferenciasCount = parseInt(checkTransferencias.rows[0].count, 10);
    if (transferenciasCount > 0) {
      throw new Error(
        "No se puede eliminar el usuario porque tiene transferencias asociadas."
      );
    }
    const deleteUserQuery = {
      text: "DELETE FROM usuarios WHERE id = $1",
      values: [id],
    };
    const response = await pool.query(deleteUserQuery);
    if (response.rowCount === 0) {
      throw new Error("Usuario no encontrado");
    }
    return "Usuario eliminado exitosamente";
  } catch (error) {
    throw error;
  }
};

const addTransferQuery = async (datos) => {
  const { emisor, receptor, monto } = datos;
  const { id: emisorId } = (
    await pool.query(`SELECT id FROM usuarios WHERE nombre = '${emisor}'`)
  ).rows[0];
  const { id: receptorId } = (
    await pool.query(`SELECT id FROM usuarios WHERE nombre = '${receptor}'`)
  ).rows[0];
  const registerTransfer = {
    text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW()) RETURNING *",
    values: [emisorId, receptorId, monto],
  };
  const updateBalanceEmisor = {
    text: "UPDATE usuarios SET balance = balance - $1 WHERE nombre = $2 RETURNING *",
    values: [monto, emisor],
  };
  const updateBalanceReceptor = {
    text: "UPDATE usuarios SET balance = balance + $1 WHERE nombre = $2 RETURNING *",
    values: [monto, receptor],
  };

  try {
    await pool.query("BEGIN");
    await pool.query(registerTransfer);
    await pool.query(updateBalanceEmisor);
    await pool.query(updateBalanceReceptor);
    await pool.query("COMMIT");
    return true;
  } catch (error) {
    await pool.query("ROLLBACK");
    return error;
  }
};

const getTransferQuery = async () => {
  try {
    const querys = {
      text: `SELECT e.nombre AS emisor, r.nombre AS receptor, t.monto, t.fecha
               FROM transferencias t
               JOIN usuarios e ON t.emisor = e.id
               JOIN usuarios r ON t.receptor = r.id;`,
      rowMode: "array",
    };
    const result = await pool.query(querys);
    console.log(result.rows);
    return result.rows;
  } catch (error) {
    return error;
  }
};

export {
  getDate,
  addUserQuery,
  getUserQuery,
  editUserQuery,
  deleteUserQuery,
  addTransferQuery,
  getTransferQuery,
};