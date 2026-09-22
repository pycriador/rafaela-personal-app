# Guia de Referência: Banco Público de Imagens de Exercícios

Este documento documenta o banco de dados público de imagens adotado no **Rafaela Training App**, permitindo que novos exercícios sejam cadastrados mantendo padrão visual homogêneo, livre de royalties e sem restrições de direitos autorais.

---

## 📌 Fonte Oficial dos Dados & Imagens

- **Repositório:** [Free Exercise DB (GitHub / yuhonas)](https://github.com/yuhonas/free-exercise-db)
- **Catálogo Web Visual:** [https://yuhonas.github.io/free-exercise-db/](https://yuhonas.github.io/free-exercise-db/)
- **Licença:** **The Unlicense (Domínio Público)**
  - Livre para uso comercial, pessoal, modificação e distribuição sem necessidade de atribuição ou pagamento de royalties.
- **Padrão Visual:**
  - Mais de 800 exercícios gravados em estúdio fitness padronizado, com iluminação uniforme, ângulo lateral/oblíquo e duas posições por movimento:
    - `0.jpg`: Posição inicial (setup / início da fase excêntrica)
    - `1.jpg`: Posição final (pico de contração concêntrica)

---

## 🔗 Estrutura das URLs das Imagens

Para referenciar diretamente qualquer exercício do repositório público:

```
https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/[Nome_Da_Pasta_Do_Exercicio]/0.jpg
```

### Exemplos Práticos:

| Exercício em Português | Pasta no Repositório | URL da Imagem |
|---|---|---|
| **Supino Reto com Barra** | `Barbell_Bench_Press_-_Medium_Grip` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg` |
| **Supino Inclinado com Halteres** | `Incline_Dumbbell_Press` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg` |
| **Crucifixo com Halteres** | `Dumbbell_Flyes` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg` |
| **Flexão de Braço** | `Pushups` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg` |
| **Puxada Frontal** | `Wide-Grip_Lat_Pulldown` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg` |
| **Remada Curvada** | `Bent_Over_Barbell_Row` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg` |
| **Remada Unilateral (Serrote)** | `One-Arm_Dumbbell_Row` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg` |
| **Barra Fixa (Pull-up)** | `Pullups` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg` |
| **Leg Press 45º** | `Leg_Press` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg` |
| **Agachamento Livre** | `Barbell_Squat` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg` |
| **Agachamento Goblet** | `Goblet_Squat` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg` |
| **Cadeira Extensora** | `Leg_Extensions` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg` |
| **Mesa Flexora** | `Lying_Leg_Curls` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg` |
| **Stiff com Barra** | `Stiff-Legged_Barbell_Deadlift` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg` |
| **Afundo com Halteres** | `Dumbbell_Lunges` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg` |
| **Desenvolvimento Halteres** | `Dumbbell_Shoulder_Press` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg` |
| **Elevação Lateral** | `Side_Lateral_Raise` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg` |
| **Elevação Frontal Cabo** | `Front_Cable_Raise` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/0.jpg` |
| **Rosca Direta** | `Barbell_Curl` ou `EZ-Bar_Curl` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg` |
| **Rosca Alternada** | `Dumbbell_Bicep_Curl` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg` |
| **Rosca Martelo** | `Hammer_Curls` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg` |
| **Tríceps Pulley** | `Triceps_Pushdown_-_Rope_Attachment` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg` |
| **Tríceps Francês** | `Seated_Triceps_Press` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/0.jpg` |
| **Tríceps Testa** | `Decline_EZ_Bar_Triceps_Extension` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_EZ_Bar_Triceps_Extension/0.jpg` |
| **Prancha Isométrica** | `Plank` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg` |
| **Abdominal Solo** | `Crunches` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg` |
| **Elevação de Pernas** | `Hanging_Leg_Raise` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg` |
| **Dead Bug** | `Dead_Bug` | `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dead_Bug/0.jpg` |

---

## 🛠️ Como Adicionar um Novo Exercício no Futuro

1. Acesse o catálogo visual: [https://yuhonas.github.io/free-exercise-db/](https://yuhonas.github.io/free-exercise-db/)
2. Digite o nome em inglês do exercício desejado (ex: `Calf Raise`, `Dips`, `Face Pull`, `Hip Thrust`).
3. Clique no exercício para copiar o identificador da pasta.
4. Monte a URL da imagem:
   `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/[Identificador]/0.jpg`
5. No app, ao cadastrar um novo exercício pelo botão **"Novo Exercício"** em `/personal/exercises`, insira essa URL no campo correspondente ou vincule no array `initialExercises` em `src/data/exercises.ts`.
