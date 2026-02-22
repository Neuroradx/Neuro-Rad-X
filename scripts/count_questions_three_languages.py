#!/usr/bin/env python3
"""
Cuenta cuántas preguntas en Firestore tienen contenido en los tres idiomas (en, es, de).

Requisitos:
  pip install firebase-admin python-dotenv

Uso:
  1. Con archivo JSON de cuenta de servicio:
     export GOOGLE_APPLICATION_CREDENTIALS="ruta/al/serviceAccountKey.json"
     python scripts/count_questions_three_languages.py

  2. Con .env.local (variable firebase_service_account = JSON en una línea):
     pip install python-dotenv
     python scripts/count_questions_three_languages.py

  3. Pasando la ruta al JSON por argumento:
     python scripts/count_questions_three_languages.py path/to/serviceAccountKey.json
"""

import os
import sys
import json

# Cargar variables de entorno desde .env.local si existe
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    load_dotenv(env_path)
except ImportError:
    pass

def has_content(translation: dict) -> bool:
    """True si existe questionText no vacío y al menos una opción con texto."""
    if not translation or not isinstance(translation, dict):
        return False
    question_text = translation.get('questionText') or translation.get('question_text') or ''
    if not isinstance(question_text, str) or not question_text.strip():
        return False
    options = translation.get('options') or []
    if not isinstance(options, list) or len(options) == 0:
        return False
    # Al menos una opción con texto
    for opt in options:
        if isinstance(opt, dict):
            t = (opt.get('text') or opt.get('optionText') or '').strip()
        elif isinstance(opt, str):
            t = opt.strip()
        else:
            t = ''
        if t:
            return True
    return False


def main():
    import firebase_admin
    from firebase_admin import credentials, firestore

    cred = None
    # 1) Argumento: ruta a archivo JSON
    if len(sys.argv) > 1 and sys.argv[1].endswith('.json'):
        cred_path = os.path.abspath(sys.argv[1])
        if not os.path.isfile(cred_path):
            print(f"Error: archivo no encontrado: {cred_path}", file=sys.stderr)
            sys.exit(1)
        cred = credentials.Certificate(cred_path)
    # 2) Variable de entorno con JSON en string (como .env.local con firebase_service_account)
    elif os.environ.get('firebase_service_account'):
        try:
            account_info = json.loads(os.environ['firebase_service_account'])
            cred = credentials.Certificate(account_info)
        except Exception as e:
            print(f"Error al parsear firebase_service_account: {e}", file=sys.stderr)
            sys.exit(1)
    # 3) Ruta en GOOGLE_APPLICATION_CREDENTIALS
    elif os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
        cred_path = os.environ['GOOGLE_APPLICATION_CREDENTIALS']
        if os.path.isfile(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            print(f"Error: GOOGLE_APPLICATION_CREDENTIALS no es un archivo: {cred_path}", file=sys.stderr)
            sys.exit(1)
    else:
        print(
            "Uso: definir credenciales de una de estas formas:\n"
            "  - Variable firebase_service_account (JSON) en .env.local\n"
            "  - GOOGLE_APPLICATION_CREDENTIALS=ruta/al/serviceAccountKey.json\n"
            "  - python count_questions_three_languages.py ruta/al/serviceAccountKey.json",
            file=sys.stderr
        )
        sys.exit(1)

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()

    questions_ref = db.collection('questions')
    total = 0
    with_three_languages = 0
    only_en = 0
    en_and_es = 0
    en_and_de = 0

    for doc in questions_ref.stream():
        total += 1
        data = doc.to_dict()
        translations = data.get('translations') or {}
        en = translations.get('en') or translations.get('EN')
        es = translations.get('es') or translations.get('ES')
        de = translations.get('de') or translations.get('DE')

        has_en = has_content(en)
        has_es = has_content(es)
        has_de = has_content(de)

        if has_en and has_es and has_de:
            with_three_languages += 1
        elif has_en and has_es:
            en_and_es += 1
        elif has_en and has_de:
            en_and_de += 1
        elif has_en:
            only_en += 1

    print("--- Preguntas en Firestore (idiomas) ---")
    print(f"Total de preguntas: {total}")
    print(f"Con los tres idiomas (en, es, de): {with_three_languages}")
    print(f"Solo inglés: {only_en}")
    print(f"Inglés y español: {en_and_es}")
    print(f"Inglés y alemán: {en_and_de}")
    if total > 0:
        pct = 100.0 * with_three_languages / total
        print(f"\nPorcentaje con tres idiomas: {pct:.1f}%")


if __name__ == '__main__':
    main()
