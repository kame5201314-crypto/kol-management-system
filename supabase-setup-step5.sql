-- Step 5: 建立觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_kols_updated_at ON kols;
CREATE TRIGGER update_kols_updated_at
  BEFORE UPDATE ON kols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collaborations_updated_at ON collaborations;
CREATE TRIGGER update_collaborations_updated_at
  BEFORE UPDATE ON collaborations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_tracking_updated_at ON sales_tracking;
CREATE TRIGGER update_sales_tracking_updated_at
  BEFORE UPDATE ON sales_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
