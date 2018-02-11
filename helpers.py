import time

def convert_timestamp_to_date(input_val, date_format='%m/%d/%Y %H:%M'):
	try:
		input_val = time.strftime(date_format)
	except:
		return None
	return input_val
