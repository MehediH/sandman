import { useState } from "react"

export default function Search() {
  const [search, setSearch] = useState('')
  const [result, setResult] = useState({})
  const handleChange = (e) => {
    setSearch(e.target.value)
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      const response = await fetch(`/api/searchSongs?songName=${search}`).then(res => res.json());
      setResult(response[0].title)
    }}>
      <label htmlFor='input'>Search
      <input className='bg-gray-200' type='text' value={search} onChange={(e) => handleChange(e)}/></label>
      <button type='submit'>Search song</button>
    </form>
    )
}
