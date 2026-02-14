/**
 * Test user provisioning for Asgardeo Thunder.
 *
 * The admin user (admin/admin) is already created by the bootstrap
 * script (01-default-resources.sh) during the 3-stage Docker init.
 *
 * We use the admin user for e2e testing since creating additional users
 * requires JWT Bearer auth which needs a full OAuth flow.
 */

export async function provisionThunderTestUser(): Promise<void> {
  console.log(`[E2E] Thunder test user: using pre-created admin user (admin/admin)`);
  console.log(`[E2E] Admin user was created by Thunder bootstrap (01-default-resources.sh)`);
}
