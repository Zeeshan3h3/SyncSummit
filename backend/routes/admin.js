router.get('/users', authorize('admin','superadmin'), getAllUsers);
router.patch('/users/:id/role', authorize('superadmin'), changeUserRole);
router.get('/financials', authorize('superadmin'), getFinancials);


router.post('/broadcast', authorize('admin','superadmin'),
  async (req, res) => {
    io.emit('schedule-update', { message: req.body.message });
    res.json({ sent: true });
  }
);