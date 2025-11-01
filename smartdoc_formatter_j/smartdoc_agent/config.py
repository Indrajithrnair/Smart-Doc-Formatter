import os
from dotenv import load_dotenv, dotenv_values

# Load environment variables from .env file
project_root_dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(project_root_dotenv_path):
    load_dotenv(project_root_dotenv_path, verbose=True, override=True)
else:
    config_dir_dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(config_dir_dotenv_path):
        load_dotenv(config_dir_dotenv_path, verbose=True, override=True)
    else:
        load_dotenv(verbose=True, override=True)

DUMMY_KEYS = [
    "DUMMY_KEY_PROJECT_ROOT",
    "YOUR_GROQ_API_KEY_HERE",
    "DUMMY_KEY_FOR_TESTING_CLI_FLOW",
    "DUMMY_KEY_DO_NOT_USE_FOR_REAL_CALLS"
]

def get_groq_api_keys():
    """
    Returns a list of Groq API keys from the GROQ_API_KEYS environment variable.
    Filters out any dummy or placeholder keys.
    """
    keys_str = os.getenv("GROQ_API_KEYS")
    
    if not keys_str:
        # Fallback to the singular GROQ_API_KEY for backward compatibility
        single_key = os.getenv("GROQ_API_KEY")
        if not single_key:
            raise ValueError("Neither GROQ_API_KEYS nor GROQ_API_KEY is set. Please add at least one to your .env file or set it as an environment variable.")
        keys_str = single_key

    # Split the string by commas and strip whitespace from each key
    keys_list = [key.strip() for key in keys_str.split(',')]
    
    # Filter out empty strings and dummy keys
    valid_keys = [key for key in keys_list if key and key not in DUMMY_KEYS]
    
    if not valid_keys:
        raise ValueError("No valid Groq API keys found. Please check your GROQ_API_KEYS environment variable.")
    
    print(f"ℹ️ [config.get_groq_api_keys] Found {len(valid_keys)} valid API key(s).")
    return valid_keys

# For single key access if needed elsewhere, though the agent will use the list.
def get_groq_api_key():
    """
    For backward compatibility, returns the first valid key from the list.
    It is recommended to use get_groq_api_keys() for the new agent implementation.
    """
    try:
        return get_groq_api_keys()[0]
    except (ValueError, IndexError):
        # This will raise the ValueError from get_groq_api_keys if no keys are found.
        # The IndexError is a safeguard.
        raise ValueError("Could not retrieve a single valid Groq API key.")

