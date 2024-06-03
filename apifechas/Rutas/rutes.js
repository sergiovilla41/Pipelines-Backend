const express = require('express');
const router = express.Router();
const festivoController = require('../controllers/festivos-controller');
const { check } = require('express-validator');

/**
 * @swagger
 * /listar-festivos/{year}:
 *   get:
 *     summary: Listar festivos por año
 *     description: Retorna una lista de festivos para el año especificado.
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año para el cual se desean listar los festivos.
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Fecha:
 *                     type: string
 *                     format: date
 *                     description: Fecha del festivo en formato ISO (YYYY-MM-DD).
 *                   Nombre:
 *                     type: string
 *                     description: Nombre del festivo.
 *       '400':
 *         description: La solicitud es inválida.
 *       '404':
 *         description: No se encontraron festivos para el año especificado.
 *       '500':
 *         description: Error interno del servidor.
 */
router.get('/listar-festivos/:year', festivoController.listarFestivos);

/**
 * @swagger
 * /verificar-festivo/{year}/{month}/{day}:
 *   get:
 *     summary: Verificar si una fecha es festiva
 *     description: Verifica si la fecha especificada corresponde a un día festivo y proporciona información adicional si es necesario.
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año de la fecha a verificar.
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: path
 *         name: month
 *         required: true
 *         description: Mes de la fecha a verificar (número entre 1 y 12).
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: path
 *         name: day
 *         required: true
 *         description: Día de la fecha a verificar (número entre 1 y 31 dependiendo del mes).
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Mensaje:
 *                   type: string
 *                   description: Mensaje indicando si la fecha es festiva y el nombre del festivo si corresponde.
 *                 NuevaFecha:
 *                   type: string
 *                   format: date
 *                   description: Si la fecha es festiva y se ha calculado una nueva fecha, se proporciona aquí en formato ISO (YYYY-MM-DD).
 *       '400':
 *         description: La solicitud es inválida (por ejemplo, si la fecha especificada es inválida).
 *       '404':
 *         description: No se encontraron festivos para la fecha especificada.
 *       '500':
 *         description: Error interno del servidor.
 */
router.get('/verificar-festivo/:year/:month/:day', [
  check('year').isInt(),
  check('month').isInt(),
  check('day').isInt(),
], festivoController.verificarFestivo);

/**
 * @swagger
 * /semana-santa/{year}:
 *   get:
 *     summary: Obtener el inicio de Semana Santa
 *     description: Obtiene la fecha de inicio de Semana Santa para el año especificado.
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año para el cual se desea obtener el inicio de Semana Santa.
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inicioSemanaSanta:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio de Semana Santa en formato ISO (YYYY-MM-DD).
 *       '400':
 *         description: La solicitud es inválida (por ejemplo, si el año especificado no es válido).
 *       '500':
 *         description: Error interno del servidor.
 */
router.get('/semana-santa/:year', festivoController.obtenerInicioSemanaSanta);

module.exports = router;
