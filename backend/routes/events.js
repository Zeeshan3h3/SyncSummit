router.get('/', getAllEvents);              // anyone
router.get('/:id', getEvent);             
router.post('/', authenticate, authorize('admin','superadmin'), createEvent);
router.put('/:id', authenticate, authorize('admin','superadmin'), updateEvent);
router.delete('/:id', authenticate, authorize('superadmin'), deleteEvent);