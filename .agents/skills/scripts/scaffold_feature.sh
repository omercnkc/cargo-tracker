#!/usr/bin/env bash
# Kargo Takip App - yeni feature iskeleti oluşturur.
# Kullanım: ./scaffold_feature.sh <feature-adi> [src-yolu]
# Örnek:    ./scaffold_feature.sh tracking src

set -euo pipefail

FEATURE_NAME="${1:?Kullanım: scaffold_feature.sh <feature-adi> [src-yolu]}"
SRC_DIR="${2:-src}"
FEATURE_DIR="${SRC_DIR}/features/${FEATURE_NAME}"

if [ -d "$FEATURE_DIR" ]; then
  echo "Hata: ${FEATURE_DIR} zaten mevcut." >&2
  exit 1
fi

mkdir -p \
  "${FEATURE_DIR}/screens" \
  "${FEATURE_DIR}/components" \
  "${FEATURE_DIR}/repositories" \
  "${FEATURE_DIR}/services" \
  "${FEATURE_DIR}/hooks"

CAP_NAME="$(tr '[:lower:]' '[:upper:]' <<< "${FEATURE_NAME:0:1}")${FEATURE_NAME:1}"

cat > "${FEATURE_DIR}/types.ts" <<EOF
// ${CAP_NAME} feature'ına özel tipler burada tanımlanır.
export interface ${CAP_NAME}Placeholder {
  id: string;
}
EOF

cat > "${FEATURE_DIR}/services/${FEATURE_NAME}Service.ts" <<EOF
import { apiClient } from '@/services/apiClient';
import type { ${CAP_NAME}Placeholder } from '../types';

export const ${FEATURE_NAME}Service = {
  getAll: () => apiClient.get<${CAP_NAME}Placeholder[]>('/api/${FEATURE_NAME}'),
};
EOF

cat > "${FEATURE_DIR}/repositories/${FEATURE_NAME}Repository.ts" <<EOF
import { ${FEATURE_NAME}Service } from '../services/${FEATURE_NAME}Service';

export const ${FEATURE_NAME}Repository = {
  getAll: () => ${FEATURE_NAME}Service.getAll(),
};
EOF

cat > "${FEATURE_DIR}/screens/${CAP_NAME}Screen.tsx" <<EOF
import React from 'react';
import { View, Text } from 'react-native';

export const ${CAP_NAME}Screen = () => {
  return (
    <View>
      <Text>${CAP_NAME} Screen</Text>
    </View>
  );
};
EOF

cat > "${FEATURE_DIR}/index.ts" <<EOF
export { ${CAP_NAME}Screen } from './screens/${CAP_NAME}Screen';
export { ${FEATURE_NAME}Repository } from './repositories/${FEATURE_NAME}Repository';
export type { ${CAP_NAME}Placeholder } from './types';
EOF

echo "✅ '${FEATURE_NAME}' feature iskeleti oluşturuldu: ${FEATURE_DIR}"
find "${FEATURE_DIR}" -type f | sort