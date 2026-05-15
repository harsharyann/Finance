"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  payment_method: z.string().optional(),
  note: z.string().optional(),
  date: z.string().min(1, "Date is required"),
})

const categories = [
  "Shop Stock",
  "Food",
  "Transport",
  "Electricity",
  "Salary",
  "Rent",
  "Personal",
  "Miscellaneous",
  "Other"
]

export function AddTransactionModal({ 
  children, 
  onTransactionAdded 
}: { 
  children?: React.ReactNode, 
  onTransactionAdded?: () => void 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customCategory, setCustomCategory] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: "",
      category: "",
      payment_method: "Cash",
      note: ""
    },
  })

  const selectedCategory = form.watch("category")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      let { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in to add a transaction")
        return
      }

      const finalCategory = values.category === "Other" ? customCategory : values.category

      if (!finalCategory) {
        toast.error("Please specify a category")
        setLoading(false)
        return
      }

      const { error } = await (supabase.from('transactions') as any)
        .insert({
          user_id: user.id,
          amount: parseFloat(values.amount),
          type: values.type,
          category: finalCategory,
          payment_method: values.payment_method,
          note: values.note,
          date: values.date,
        })

      if (error) throw error

      toast.success("Transaction added successfully!")
      setOpen(false)
      form.reset()
      setCustomCategory("")
      onTransactionAdded?.()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to add transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (children as any) || (
            <Button className="rounded-xl gap-2 font-bold shadow-md hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border-none shadow-2xl animate-in-slide">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Add Transaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 bg-background border-border">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" className="rounded-xl h-12 bg-background border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12 bg-background border-border">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory === "Other" && (
              <div className="animate-in-fade">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Custom Category Name</FormLabel>
                <Input 
                  placeholder="Enter category name" 
                  className="rounded-xl h-12 bg-background border-border"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl h-12 bg-background border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 bg-background border-border">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="What was this for?" className="rounded-xl h-12 bg-background border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2 shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Transaction"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
