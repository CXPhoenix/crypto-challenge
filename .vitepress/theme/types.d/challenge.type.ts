export interface Challenge {
  id: number
  title: string
  url: string
  difficulty: 'easy' | 'medium' | 'hard' | string
  tags: string[]
}