// Reglas de pertenencia: un cliente solo ve y modifica lo suyo; el admin puede todo.
// Van en las rutas después de authMiddleware (que deja req.user = { userId, role }).

const isAdminUser = (req) => req.user?.role === 'admin';
const sameId = (a, b) => a != null && b != null && String(a) === String(b);

// Para rutas como /orders/user/:userId
export const selfOrAdmin = (param = 'userId') => (req, res, next) => {
  if (isAdminUser(req) || sameId(req.params[param], req.user?.userId)) return next();
  return res.status(403).json({ message: 'No tienes acceso a los datos de otro usuario' });
};

// Para rutas como /orders/:id: carga el documento y revisa su campo de dueño.
export const ownerOrAdmin = (Model, param = 'id', field = 'user') => async (req, res, next) => {
  try {
    if (isAdminUser(req)) return next();
    const doc = await Model.findById(req.params[param]).select(field).lean();
    if (!doc) return next(); // el controlador responde 404
    if (sameId(doc[field], req.user?.userId)) return next();
    return res.status(403).json({ message: 'No tienes acceso a este recurso' });
  } catch (error) {
    next(error);
  }
};

// En altas: el dueño es quien inicia sesión, no lo que mande el cliente en el body.
export const bindBodyUser = (field = 'user') => (req, res, next) => {
  if (!isAdminUser(req)) {
    req.body = { ...(req.body || {}), [field]: req.user.userId };
  }
  next();
};
