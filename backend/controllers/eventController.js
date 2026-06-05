export const getAllEvents = async (req, res, next) => {
  res.json({ message: "Get all events" });
};

export const getEvent = async (req, res, next) => {
  res.json({ message: "Get single event" });
};


export const createEvent = async (req, res, next) => {
  res.json({ message: "Create event" });
};

export const updateEvent = async (req, res, next) => {
  res.json({ message: "Update event" });
};

export const deleteEvent = async (req, res, next) => {
  res.json({ message: "Delete event" });
};